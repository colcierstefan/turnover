import { readFile } from "node:fs/promises";
import { z } from "zod";

const FIXTURES_PATH =
  "src/handyman/evals/handyman-message-translation.fixtures.json";

const translationEvalCaseSchema = z.object({
  id: z.string(),
  textEn: z.string(),
  mustContain: z.array(z.string()),
});
export type TranslationEvalCase = z.infer<typeof translationEvalCaseSchema>;

const fixturesSchema = z.object({ cases: z.array(translationEvalCaseSchema) });

export const loadHandymanMessageTranslationEvalCases = async () =>
  fixturesSchema.parse(JSON.parse(await readFile(FIXTURES_PATH, "utf8"))).cases;
