import { readFile } from "node:fs/promises";
import { z } from "zod";

import { loadIssueReportEvalCases } from "@turnover/core/issue/evals/issue-report.dataset";
import {
  ApplianceCategory,
  HandymanTrade,
  UserLanguage,
} from "@turnover/db/enums";

const FIXTURES_PATH = "src/handyman/evals/handyman-message-draft.fixtures.json";

const draftFixtureSchema = z.object({
  id: z.string(),
  reportCaseId: z.string().nullable(),
  description: z.string().nullable(),
  guestName: z.string().nullable(),
  applianceCategory: z.enum(ApplianceCategory).nullable(),
  likelyCause: z.string(),
  trade: z.enum(HandymanTrade),
  unitAddress: z.string(),
  addressParts: z.array(z.string()).min(1),
  recipientName: z.string().nullable(),
  managerLanguage: z.enum(UserLanguage),
});

const translationEvalCaseSchema = z.object({
  id: z.string(),
  textEn: z.string(),
  mustContain: z.array(z.string()),
});
export type TranslationEvalCase = z.infer<typeof translationEvalCaseSchema>;

const fixturesSchema = z.object({
  draftCases: z.array(draftFixtureSchema),
  translationCases: z.array(translationEvalCaseSchema),
});

export type DraftEvalCase = Omit<
  z.infer<typeof draftFixtureSchema>,
  "description"
> & { description: string };

export const loadHandymanMessageEvalCases = async () => {
  const fixtures = fixturesSchema.parse(
    JSON.parse(await readFile(FIXTURES_PATH, "utf8")),
  );
  const reportCases = await loadIssueReportEvalCases();
  const draftCases: DraftEvalCase[] = fixtures.draftCases.map((fixture) => ({
    ...fixture,
    description:
      fixture.description ??
      requireReportDescription(reportCases, fixture.reportCaseId),
  }));
  return { draftCases, translationCases: fixtures.translationCases };
};

const requireReportDescription = (
  reportCases: ReadonlyArray<{ id: string; description: string }>,
  reportCaseId: string | null,
) => {
  const reportCase = reportCases.find(({ id }) => id === reportCaseId);
  if (!reportCase) throw new Error(`Unknown report case ${reportCaseId}`);
  return reportCase.description;
};
