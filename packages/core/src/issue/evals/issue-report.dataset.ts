import { readFile } from "node:fs/promises";
import { z } from "zod";

import { HANDYMAN_TRADES } from "@turnover/core/issue/constants/issue.constants";
import type { UnitAppliance } from "@turnover/core/issue/schemas/report-triage.schema";
import {
  ApplianceCategory,
  EmergencyType,
  IssueCategory,
  ReporterLanguage,
  ReporterRole,
} from "@turnover/db/enums";

const FIXTURES_PATH = "src/issue/evals/issue-report.fixtures.json";

export const EVAL_UNIT_APPLIANCES: ReadonlyArray<UnitAppliance> = [
  { category: "WASHING_MACHINE", brand: "Bosch", model: "WAN28262BY" },
  { category: "FRIDGE", brand: "Arctic", model: "AK60350M40W" },
  { category: "OVEN", brand: "Gorenje", model: "BO735E20X" },
  { category: "HOB", brand: "Gorenje", model: "GW641EX" },
  { category: "MICROWAVE", brand: "Whirlpool", model: "MWP 253 W" },
  { category: "DISHWASHER", brand: "Beko", model: "DFN05320W" },
  { category: "EXTRACTOR_HOOD", brand: "Teka", model: "CNL 6400" },
  { category: "AIR_CONDITIONER", brand: "Daikin", model: "FTXM25R" },
  { category: "WATER_HEATER", brand: "Ariston", model: "Pro1 R 80 V" },
  { category: "TV", brand: "Samsung", model: "UE43TU7172" },
  { category: "COFFEE_MACHINE", brand: "DeLonghi", model: "ECAM22.110.B" },
];

const expectedValueSchema = <Value extends z.ZodType>(value: Value) =>
  z.union([value.nullable(), z.array(value.nullable())]);

const issueReportEvalCaseSchema = z.object({
  id: z.string(),
  language: z.enum(ReporterLanguage),
  role: z.enum(ReporterRole),
  description: z.string(),
  followUps: z.array(z.object({ question: z.string(), answer: z.string() })),
  expected: z.object({
    emergencyType: z.union([
      z.enum(EmergencyType).nullable(),
      z.array(z.enum(EmergencyType).nullable()),
    ]),
    hasTips: z.boolean().nullable(),
    diagnosis: z.object({
      applianceCategory: expectedValueSchema(
        z.enum(ApplianceCategory),
      ).optional(),
      category: expectedValueSchema(z.enum(IssueCategory)).optional(),
      trade: expectedValueSchema(z.enum(HANDYMAN_TRADES)).optional(),
    }),
  }),
});
export type IssueReportEvalCase = z.infer<typeof issueReportEvalCaseSchema>;

export const loadIssueReportEvalCases = async () =>
  z
    .object({ cases: z.array(issueReportEvalCaseSchema) })
    .parse(JSON.parse(await readFile(FIXTURES_PATH, "utf8"))).cases;

export const isExpectedEmergency = (evalCase: IssueReportEvalCase) =>
  !Array.isArray(evalCase.expected.emergencyType) &&
  evalCase.expected.emergencyType !== null;
