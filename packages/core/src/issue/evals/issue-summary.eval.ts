import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import { loadIssueSummaryEvalCases } from "@turnover/core/issue/evals/issue-summary.dataset";
import {
  ISSUE_SUMMARY_JUDGE_NAME,
  scoreSummary,
} from "@turnover/core/issue/evals/issue-summary.evaluators";
import { issueSummaryInputSchema } from "@turnover/core/issue/schemas/issue-summary.schema";
import issueSummaryService from "@turnover/core/issue/services/issue-summary.service";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

const CALL_NAME = "issue-summary";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const cases = selectEvalCases(
  await loadIssueSummaryEvalCases(),
  parseEvalArgs(process.argv),
);

const scores = [];
try {
  for (const evalCase of cases) {
    const summary = await issueSummaryService
      .summarize(
        issueSummaryInputSchema.parse({
          ...evalCase.facts,
          language: evalCase.language,
        }),
      )
      .catch((error: unknown) => {
        logger.error({ id: evalCase.id, err: error }, "summary failed");
        return null;
      });
    if (!summary) {
      scores.push({ parsed: false });
      continue;
    }
    const { score, problems } = await scoreSummary(evalCase, summary);
    scores.push({ parsed: true, ...score });
    logger.info(
      { id: evalCase.id, summary, score, problems },
      Object.values(score).every(Boolean) ? "ok" : "miss",
    );
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  { cases: scores.length, accuracy: summarizeFieldScores(scores) },
  `${CALL_NAME} results`,
);
logger.info(
  {
    summary: await fetchModelCallUsage(CALL_NAME, startedAt, cases.length),
    judge: await fetchModelCallUsage(
      ISSUE_SUMMARY_JUDGE_NAME,
      startedAt,
      scores.length,
    ),
  },
  "usage from Langfuse",
);
