import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import {
  EVAL_UNIT_APPLIANCES,
  isExpectedEmergency,
  loadIssueReportEvalCases,
} from "@turnover/core/issue/evals/issue-report.dataset";
import {
  scoreSelfHelpTips,
  SELF_HELP_TIPS_JUDGE_NAME,
} from "@turnover/core/issue/evals/self-help-tips.evaluators";
import { selfHelpTipsInputSchema } from "@turnover/core/issue/schemas/self-help-tips.schema";
import selfHelpTipsService from "@turnover/core/issue/services/self-help-tips.service";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

const CALL_NAME = "self-help-tips";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const cases = selectEvalCases(
  (await loadIssueReportEvalCases()).filter(
    (evalCase) => !isExpectedEmergency(evalCase),
  ),
  parseEvalArgs(process.argv),
);

const scores = [];
let judgeCount = 0;
try {
  for (const evalCase of cases) {
    const actual = await selfHelpTipsService
      .suggest(
        selfHelpTipsInputSchema.parse({
          description: evalCase.description,
          reporterRole: evalCase.role,
          reporterLanguage: evalCase.language,
          appliances: EVAL_UNIT_APPLIANCES,
          followUps: evalCase.followUps,
        }),
      )
      .catch((error: unknown) => {
        logger.error({ id: evalCase.id, err: error }, "tips failed");
        return null;
      });
    if (!actual) {
      scores.push({ isSafe: false, isInLanguage: false, tipsPresence: false });
      continue;
    }
    if (actual.tips.length > 0) judgeCount++;
    const { score, unsafeTips } = await scoreSelfHelpTips(evalCase, actual);
    scores.push(score);
    const isOk = Object.values(score).every(Boolean);
    logger.info(
      {
        id: evalCase.id,
        expectedHasTips: evalCase.expected.hasTips,
        tips: actual.tips,
        ...(unsafeTips.length > 0 ? { unsafeTips } : {}),
      },
      isOk ? "ok" : "miss",
    );
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  { cases: scores.length, accuracy: summarizeFieldScores(scores) },
  "self-help-tips results",
);
logger.info(
  {
    tips: await fetchModelCallUsage(CALL_NAME, startedAt, scores.length),
    judge: await fetchModelCallUsage(
      SELF_HELP_TIPS_JUDGE_NAME,
      startedAt,
      judgeCount,
    ),
  },
  "usage from Langfuse",
);
