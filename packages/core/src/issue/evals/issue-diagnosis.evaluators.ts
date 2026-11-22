import {
  PRICE_LINES,
  type PriceEvalCase,
  type PriceLine,
} from "@turnover/core/issue/evals/issue-diagnosis.dataset";
import type { IssueReportEvalCase } from "@turnover/core/issue/evals/issue-report.dataset";
import type {
  CostRange,
  DiagnosisAppliance,
  IssueDiagnosisOutput,
} from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import { matchesExpected } from "@turnover/core/utils/eval.utils";

export type PriceScore = {
  id: string;
  line: PriceLine;
  realRon: number;
  estimate: CostRange | null;
  isInside: boolean;
  errorPercent: number | null;
};

export const scoreDiagnosisFields = (
  evalCase: IssueReportEvalCase,
  actual: IssueDiagnosisOutput,
  appliances: ReadonlyArray<DiagnosisAppliance>,
) => {
  const expected = evalCase.expected.diagnosis;
  const actualApplianceCategory =
    appliances.find((appliance) => appliance.id === actual.applianceId)
      ?.category ?? null;
  const isEqual = <Value>(left: Value, right: Value) => left === right;
  return {
    ...(expected.applianceCategory !== undefined && {
      applianceCategory: matchesExpected(
        expected.applianceCategory,
        actualApplianceCategory,
        isEqual,
      ),
    }),
    ...(expected.category !== undefined && {
      category: matchesExpected(expected.category, actual.category, isEqual),
    }),
    ...(expected.trade !== undefined && {
      trade: matchesExpected(expected.trade, actual.trade, isEqual),
    }),
  };
};

export const scorePrices = (
  evalCase: PriceEvalCase,
  actual: IssueDiagnosisOutput,
): PriceScore[] =>
  PRICE_LINES.flatMap((line) => {
    const real = evalCase.prices[line];
    if (!real) return [];
    const realRon = (real.minRon + real.maxRon) / 2;
    const estimate = getEstimate(line, actual);
    return [
      {
        id: evalCase.id,
        line,
        realRon,
        estimate,
        isInside:
          estimate !== null &&
          realRon >= estimate.minRon &&
          realRon <= estimate.maxRon,
        errorPercent:
          estimate === null
            ? null
            : Math.round(
                (Math.abs((estimate.minRon + estimate.maxRon) / 2 - realRon) /
                  realRon) *
                  100,
              ),
      },
    ];
  });

export const summarizePriceScores = (scores: ReadonlyArray<PriceScore>) => {
  const errors = scores
    .flatMap((score) =>
      score.errorPercent === null ? [] : [score.errorPercent],
    )
    .sort((left, right) => left - right);
  return {
    prices: scores.length,
    inside: `${scores.filter((score) => score.isInside).length}/${scores.length}`,
    missingEstimates: scores.filter((score) => score.estimate === null).length,
    medianErrorPercent: errors.length === 0 ? null : getMedian(errors),
    worstErrorPercent: errors.at(-1) ?? null,
  };
};

const getEstimate = (
  line: PriceLine,
  actual: IssueDiagnosisOutput,
): CostRange | null => {
  switch (line) {
    case "partRon":
      return actual.partCostRon;
    case "labourRon":
      return actual.labourCostRon;
    case "newApplianceRon":
      return actual.newApplianceCostRon;
    case "repairTotalRon":
      if (!actual.partCostRon && !actual.labourCostRon) return null;
      return {
        minRon:
          (actual.partCostRon?.minRon ?? 0) +
          (actual.labourCostRon?.minRon ?? 0),
        maxRon:
          (actual.partCostRon?.maxRon ?? 0) +
          (actual.labourCostRon?.maxRon ?? 0),
      };
  }
};

const getMedian = (sorted: ReadonlyArray<number>) => {
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};
