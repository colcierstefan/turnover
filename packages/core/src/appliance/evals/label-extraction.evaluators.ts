import type { LabelExpected } from "@turnover/core/appliance/evals/label-extraction.dataset";
import type { LabelExtractionOutput } from "@turnover/core/appliance/schemas/label-extraction.schema";
import { isSameText, matchesExpected } from "@turnover/core/utils/eval.utils";

export const scoreLabelExtraction = (
  expected: LabelExpected,
  actual: LabelExtractionOutput,
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
