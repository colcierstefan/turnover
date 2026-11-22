import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import {
  EVAL_UNIT_APPLIANCES,
  isExpectedEmergency,
  loadIssueReportEvalCases,
} from "@turnover/core/issue/evals/issue-report.dataset";
import {
  REPORT_TRIAGE_JUDGE_NAME,
  scoreReportTriage,
} from "@turnover/core/issue/evals/report-triage.evaluators";
import { reportTriageInputSchema } from "@turnover/core/issue/schemas/report-triage.schema";
import reportTriageService from "@turnover/core/issue/services/report-triage.service";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

const CALL_NAME = "report-triage";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const cases = selectEvalCases(
  await loadIssueReportEvalCases(),
  parseEvalArgs(process.argv),
);

const scores = [];
let emergencyCount = 0;
let detectedEmergencyCount = 0;
let falseAlarmCount = 0;
let judgeCount = 0;
try {
  for (const evalCase of cases) {
    const actual = await reportTriageService
      .triage(
        reportTriageInputSchema.parse({
          description: evalCase.description,
          reporterRole: evalCase.role,
          reporterLanguage: evalCase.language,
          appliances: EVAL_UNIT_APPLIANCES,
          photos: [],
        }),
      )
      .catch((error: unknown) => {
        logger.error({ id: evalCase.id, err: error }, "triage failed");
        return null;
      });
    if (!actual) {
      scores.push({ emergencyType: false, questionsInLanguage: false });
      continue;
    }
    if (actual.questions.length > 0) judgeCount++;
    const score = await scoreReportTriage(evalCase, actual);
    scores.push(score);

    if (isExpectedEmergency(evalCase)) {
      emergencyCount++;
      if (actual.emergencyType) detectedEmergencyCount++;
    } else if (
      evalCase.expected.emergencyType === null &&
      actual.emergencyType
    ) {
      falseAlarmCount++;
    }
    const isOk = Object.values(score).every(Boolean);
    logger.info(
      {
        id: evalCase.id,
        expected: evalCase.expected.emergencyType,
        emergencyType: actual.emergencyType,
        questions: actual.questions,
      },
      isOk ? "ok" : "miss",
    );
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  {
    cases: scores.length,
    emergencyRecall: `${detectedEmergencyCount}/${emergencyCount}`,
    falseAlarms: falseAlarmCount,
    accuracy: summarizeFieldScores(scores),
  },
  "report-triage results",
);
logger.info(
  {
    triage: await fetchModelCallUsage(CALL_NAME, startedAt, scores.length),
    judge: await fetchModelCallUsage(
      REPORT_TRIAGE_JUDGE_NAME,
      startedAt,
      judgeCount,
    ),
  },
  "usage from Langfuse",
);
