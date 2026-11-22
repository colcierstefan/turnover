import { z } from "zod";

import { ApplianceCategory } from "@turnover/db/enums";

export const invoiceExtractionInputSchema = z.object({
  fileUri: z.string().startsWith("gs://"),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ]),
});
export type InvoiceExtractionInput = z.infer<
  typeof invoiceExtractionInputSchema
>;

export const invoiceExtractionOutputSchema = z.object({
  shopName: z
    .string()
    .nullable()
    .describe("Seller name as printed, e.g. eMAG, Altex, Flanco."),
  purchaseDate: z.iso.date().nullable().describe("Invoice date as YYYY-MM-DD."),
  items: z
    .array(
      z.object({
        description: z.string().describe("The invoice line text, as printed."),
        category: z
          .enum(ApplianceCategory)
          .describe("Kind of appliance. OTHER when unclear."),
        brand: z.string().nullable().describe("Brand as printed."),
        model: z
          .string()
          .nullable()
          .describe(
            "Model code as printed, e.g. WAN28262BY. Null when the line has no model code.",
          ),
        quantity: z.int().min(1).describe("Quantity on the line."),
        unitPriceRon: z
          .number()
          .nullable()
          .describe(
            "Price of one piece in RON including VAT. Null when the invoice does not show a price for the line.",
          ),
        warrantyMonths: z
          .int()
          .nullable()
          .describe(
            "Warranty in months stated on the invoice for this appliance, including any extended warranty bought for it. Null when the invoice states no warranty.",
          ),
      }),
    )
    .describe("One entry per appliance line."),
});
export type InvoiceExtractionOutput = z.infer<
  typeof invoiceExtractionOutputSchema
>;
