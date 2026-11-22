import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { ApplianceCategory } from "@turnover/db/enums";

export type LabelEvalCase = z.infer<typeof webCaseSchema> & {
  localPath: string;
};

const EVALS_DIR = "src/appliance/evals";
export const WEB_IMAGES_DIR = path.join(
  EVALS_DIR,
  "images",
  "label-extraction",
);
const RENDERED_DIR = path.join(EVALS_DIR, "fixtures", "label-extraction");

const expectedTextSchema = z.union([
  z.string(),
  z.null(),
  z.array(z.string().nullable()),
]);

const expectedSchema = z.object({
  category: z.union([
    z.enum(ApplianceCategory),
    z.array(z.enum(ApplianceCategory)),
  ]),
  brand: expectedTextSchema,
  model: expectedTextSchema,
  serialNumber: expectedTextSchema,
  manufactureDate: expectedTextSchema,
});
export type LabelExpected = z.infer<typeof expectedSchema>;

const webCaseSchema = z.object({
  id: z.string(),
  imageUrl: z.url().optional(),
  pageUrl: z.url().optional(),
  expected: expectedSchema,
});

const fixturesSchema = z.object({
  web: z.array(webCaseSchema),
  rendered: z.array(
    webCaseSchema.omit({ imageUrl: true, pageUrl: true }).passthrough(),
  ),
});

export const loadLabelEvalCases = async (): Promise<LabelEvalCase[]> => {
  const fixtures = fixturesSchema.parse(
    JSON.parse(
      await readFile(
        path.join(EVALS_DIR, "label-extraction.fixtures.json"),
        "utf8",
      ),
    ),
  );
  return [
    ...fixtures.web.map((evalCase) => ({
      ...evalCase,
      localPath: path.join(WEB_IMAGES_DIR, evalCase.id),
    })),
    ...fixtures.rendered.map((evalCase) => ({
      id: evalCase.id,
      expected: evalCase.expected,
      localPath: path.join(RENDERED_DIR, `${evalCase.id}.jpg`),
    })),
  ];
};
