import { readFile } from "node:fs/promises";
import { z } from "zod";

import { issueSummaryFactsSchema } from "@turnover/core/issue/schemas/issue-summary.schema";
import { UserLanguage } from "@turnover/db/enums";

const FIXTURES_PATH = "src/issue/evals/issue-summary.fixtures.json";

const summaryEvalCaseSchema = z.object({
  id: z.string(),
  language: z.enum(UserLanguage),
  facts: issueSummaryFactsSchema,
});
export type SummaryEvalCase = z.infer<typeof summaryEvalCaseSchema>;

const fixturesSchema = z.object({ cases: z.array(summaryEvalCaseSchema) });

export const loadIssueSummaryEvalCases = async () =>
  fixturesSchema.parse(JSON.parse(await readFile(FIXTURES_PATH, "utf8"))).cases;
