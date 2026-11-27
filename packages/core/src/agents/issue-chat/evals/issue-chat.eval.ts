import { RequestContext } from "@mastra/core/request-context";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import {
  deleteIssueChatEvalData,
  fillQuestionIds,
  loadIssueChatEvalFixtures,
  seedIssueChatEvalData,
} from "@turnover/core/agents/issue-chat/evals/issue-chat.dataset";
import { scoreIssueChatAnswer } from "@turnover/core/agents/issue-chat/evals/issue-chat.evaluators";
import { ISSUE_CHAT_AGENT_ID } from "@turnover/core/agents/issue-chat/issue-chat.agent";
import type { IssueChatRequestContext } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import mastra from "@turnover/core/agents/mastra";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const fixtures = await loadIssueChatEvalFixtures();
const cases = selectEvalCases(fixtures.cases, parseEvalArgs(process.argv));
const otherOrganizationTexts = fixtures.organizations
  .slice(1)
  .flatMap((organization) => [
    ...organization.units.map((unit) => unit.name),
    ...organization.handymen.map((handyman) => handyman.name),
  ]);
const agent = mastra.getAgentById(ISSUE_CHAT_AGENT_ID);

const seeded = await seedIssueChatEvalData(fixtures.organizations);
const scores = [];
try {
  for (const evalCase of cases) {
    const result = await agent.generate(
      fillQuestionIds(evalCase.question, seeded.ids),
      {
        requestContext: new RequestContext<IssueChatRequestContext>([
          ["userId", seeded.userId],
          ["language", evalCase.language],
          ["today", fixtures.today],
        ]),
      },
    );
    const answer = {
      text: result.text,
      toolNames: result.steps.flatMap((step) =>
        step.toolCalls.map((call) => call.payload.toolName),
      ),
      toolResults: JSON.stringify(
        result.steps.flatMap((step) =>
          step.toolResults.map((toolResult) => toolResult.payload.result),
        ),
      ),
    };
    const { score, problems } = scoreIssueChatAnswer(
      evalCase,
      answer,
      otherOrganizationTexts,
    );
    scores.push(score);
    logger.info(
      {
        id: evalCase.id,
        answer: answer.text,
        tools: answer.toolNames,
        problems,
      },
      Object.values(score).every(Boolean) ? "ok" : "miss",
    );
  }
} finally {
  await deleteIssueChatEvalData(seeded);
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  {
    cases: scores.length,
    allCorrect: scores.filter((score) => Object.values(score).every(Boolean))
      .length,
    accuracy: summarizeFieldScores(scores),
  },
  `${ISSUE_CHAT_AGENT_ID} results`,
);
logger.info(
  {
    usage: await fetchModelCallUsage(
      ISSUE_CHAT_AGENT_ID,
      startedAt,
      cases.length,
    ),
  },
  "usage from Langfuse",
);
