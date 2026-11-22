import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { ApplianceCategory } from "@turnover/db/enums";

const EVALS_DIR = "src/appliance/evals";

const expectedTextSchema = z.union([
  z.string(),
  z.null(),
  z.array(z.string().nullable()),
]);

const expectedItemSchema = z.object({
  category: z.enum(ApplianceCategory),
  brand: expectedTextSchema,
  model: expectedTextSchema,
  quantity: z.int(),
  unitPriceRon: z.number().nullable(),
  warrantyMonths: z.int().nullable(),
});

const expectedSchema = z.object({
  shopName: expectedTextSchema,
  purchaseDate: z.iso.date().nullable(),
  items: z.array(expectedItemSchema),
});
export type InvoiceExpected = z.infer<typeof expectedSchema>;

const fixturesSchema = z.object({
  invoices: z.array(z.object({ id: z.string(), expected: expectedSchema })),
});

export const loadInvoiceEvalCases = async () => {
  const fixtures = fixturesSchema.parse(
    JSON.parse(
      await readFile(
        path.join(EVALS_DIR, "invoice-extraction.fixtures.json"),
        "utf8",
      ),
    ),
  );
  return fixtures.invoices.map((invoice) => ({
    ...invoice,
    localPath: path.join(
      EVALS_DIR,
      "fixtures",
      "invoice-extraction",
      `${invoice.id}.pdf`,
    ),
  }));
};
