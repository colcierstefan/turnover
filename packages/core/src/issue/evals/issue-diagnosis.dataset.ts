import { readFile } from "node:fs/promises";
import { z } from "zod";

import { EVAL_UNIT_APPLIANCES } from "@turnover/core/issue/evals/issue-report.dataset";
import type { DiagnosisAppliance } from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import { ReporterLanguage } from "@turnover/db/enums";

const PRICE_FIXTURES_PATH =
  "src/issue/evals/issue-diagnosis-prices.fixtures.json";

export const EVAL_DIAGNOSIS_APPLIANCES: ReadonlyArray<DiagnosisAppliance> =
  EVAL_UNIT_APPLIANCES.map((appliance, index) => ({
    ...appliance,
    id: `appliance-${index + 1}`,
    manufactureDate: null,
    purchaseDate: null,
    warrantyUntil: null,
    warrantyStatus: "UNKNOWN",
  }));

const realPriceSchema = z.object({
  minRon: z.number(),
  maxRon: z.number(),
  source: z.string(),
  url: z.url(),
  checkedOn: z.iso.date(),
});

export const PRICE_LINES = [
  "partRon",
  "labourRon",
  "repairTotalRon",
  "newApplianceRon",
] as const;
export type PriceLine = (typeof PRICE_LINES)[number];

const priceEvalCaseSchema = z.object({
  id: z.string(),
  language: z.enum(ReporterLanguage),
  description: z.string(),
  prices: z.partialRecord(z.enum(PRICE_LINES), realPriceSchema),
});
export type PriceEvalCase = z.infer<typeof priceEvalCaseSchema>;

export const loadPriceEvalCases = async () =>
  z
    .object({ cases: z.array(priceEvalCaseSchema) })
    .parse(JSON.parse(await readFile(PRICE_FIXTURES_PATH, "utf8"))).cases;
