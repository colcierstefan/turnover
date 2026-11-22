import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import {
  EVAL_DIAGNOSIS_APPLIANCES,
  loadPriceEvalCases,
} from "@turnover/core/issue/evals/issue-diagnosis.dataset";
import {
  scoreDiagnosisFields,
  scorePrices,
  summarizePriceScores,
  type PriceScore,
} from "@turnover/core/issue/evals/issue-diagnosis.evaluators";
import { loadIssueReportEvalCases } from "@turnover/core/issue/evals/issue-report.dataset";
import {
  issueDiagnosisInputSchema,
  type IssueDiagnosisInput,
} from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import issueDiagnosisService from "@turnover/core/issue/services/issue-diagnosis.service";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import { toIsoDate } from "@turnover/core/utils/date.utils";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

const CALL_NAME = "issue-diagnosis";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const args = parseEvalArgs(process.argv);
const reportCases = selectEvalCases(await loadIssueReportEvalCases(), args);
const priceCases = selectEvalCases(await loadPriceEvalCases(), args);

const fieldScores = [];
const priceScores: PriceScore[] = [];
let callCount = 0;
try {
  for (const evalCase of reportCases) {
    const actual = await diagnose(evalCase.id, {
      description: evalCase.description,
      reporterRole: evalCase.role,
      emergencyType: Array.isArray(evalCase.expected.emergencyType)
        ? null
        : evalCase.expected.emergencyType,
      followUps: evalCase.followUps,
      language: evalCase.language,
    });
    if (!actual) {
      fieldScores.push({ parsed: false });
      continue;
    }
    const score = scoreDiagnosisFields(
      evalCase,
      actual,
      EVAL_DIAGNOSIS_APPLIANCES,
    );
    fieldScores.push({ parsed: true, ...score });
    logger.info(
      {
        id: evalCase.id,
        expected: evalCase.expected.diagnosis,
        appliance: EVAL_DIAGNOSIS_APPLIANCES.find(
          (appliance) => appliance.id === actual.applianceId,
        )?.category,
        category: actual.category,
        trade: actual.trade,
      },
      Object.values(score).every(Boolean) ? "ok" : "miss",
    );
  }

  for (const evalCase of priceCases) {
    const actual = await diagnose(evalCase.id, {
      description: evalCase.description,
      reporterRole: "MANAGER",
      emergencyType: null,
      followUps: [],
      language: evalCase.language,
    });
    if (!actual) continue;
    const scores = scorePrices(evalCase, actual);
    priceScores.push(...scores);
    for (const score of scores) {
      logger.info(
        score,
        score.isInside ? "inside" : `off by ${score.errorPercent ?? "-"}%`,
      );
    }
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  {
    cases: fieldScores.length,
    accuracy: summarizeFieldScores(fieldScores),
  },
  "issue-diagnosis field results",
);
logger.info(
  {
    cases: priceCases.length,
    all: summarizePriceScores(priceScores),
    byLine: Object.fromEntries(
      Object.entries(Object.groupBy(priceScores, (score) => score.line)).map(
        ([line, scores]) => [line, summarizePriceScores(scores ?? [])],
      ),
    ),
  },
  "issue-diagnosis price results",
);
logger.info(
  { diagnosis: await fetchModelCallUsage(CALL_NAME, startedAt, callCount) },
  "usage from Langfuse",
);

async function diagnose(
  id: string,
  report: Pick<
    IssueDiagnosisInput,
    "description" | "reporterRole" | "emergencyType" | "followUps" | "language"
  >,
) {
  callCount++;
  return issueDiagnosisService
    .diagnose(
      issueDiagnosisInputSchema.parse({
        ...report,
        appliances: EVAL_DIAGNOSIS_APPLIANCES,
        confirmedApplianceId: null,
        today: toIsoDate(new Date()),
        photos: [],
      }),
    )
    .catch((error: unknown) => {
      logger.error({ id, err: error }, "diagnosis failed");
      return null;
    });
}
