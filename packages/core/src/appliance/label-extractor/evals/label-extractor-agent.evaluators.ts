import type { LabelExpected } from "@turnover/core/appliance/label-extractor/evals/label-extractor-agent.dataset";
import type { LabelExtractorOutput } from "@turnover/core/appliance/label-extractor/schemas/label-extractor.schema";
import { isSameText, matchesExpected } from "@turnover/core/utils/eval.utils";

export const scoreLabelExtraction = (
  expected: LabelExpected,
  actual: LabelExtractorOutput,
) => ({
  category: matchesExpected(
    expected.category,
    actual.category,
    (left, right) => left === right,
  ),
  brand: matchesExpected(expected.brand, actual.brand, isSameText),
  model: matchesExpected(expected.model, actual.model, isSameText),
  serialNumber: matchesExpected(
    expected.serialNumber,
    actual.serialNumber,
    isSameText,
  ),
  manufactureDate: matchesExpected(
    expected.manufactureDate,
    actual.manufactureDate,
    (left, right) => left === right,
  ),
});
