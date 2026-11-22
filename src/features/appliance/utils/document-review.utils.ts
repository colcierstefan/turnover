import { invoiceExtractorOutputSchema } from "@/agents/invoice-extractor/schemas/invoice-extractor.schema";
import { labelExtractorOutputSchema } from "@/agents/label-extractor/schemas/label-extractor.schema";
import type { ApplianceFields } from "@/features/appliance/schemas/appliance.schema";
import type { DocumentKind } from "@/generated/prisma/enums";
import { toIsoDate } from "@/utils/date.utils";

export type ApplianceFieldName = keyof ApplianceFields;

export type DocumentReviewRowDraft = {
  description: string | null;
  quantity: number;
  values: Record<ApplianceFieldName, string>;
  extractedFields: ReadonlyArray<ApplianceFieldName>;
};

const EMPTY_VALUES: Record<ApplianceFieldName, string> = {
  category: "",
  brand: "",
  model: "",
  serialNumber: "",
  manufactureDate: "",
  purchaseDate: "",
  purchasePriceRon: "",
  warrantyUntil: "",
  notes: "",
};

const LABEL_FIELDS: ReadonlyArray<ApplianceFieldName> = [
  "category",
  "brand",
  "model",
  "serialNumber",
  "manufactureDate",
];

const INVOICE_FIELDS: ReadonlyArray<ApplianceFieldName> = [
  "category",
  "brand",
  "model",
  "purchaseDate",
  "purchasePriceRon",
  "warrantyUntil",
];

export const buildDocumentReview = (
  document: Readonly<{ kind: DocumentKind; extractedData: unknown }>,
) => {
  if (document.kind === "INVOICE") return buildInvoiceReview(document);
  return buildLabelReview(document);
};

export const addMonthsToIsoDate = (isoDate: string, months: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, month + months, 0),
  ).getUTCDate();
  return toIsoDate(
    new Date(
      Date.UTC(year, month - 1 + months, Math.min(day, lastDayOfTargetMonth)),
    ),
  );
};

const buildLabelReview = (document: Readonly<{ extractedData: unknown }>) => {
  const extracted =
    document.extractedData === null
      ? null
      : labelExtractorOutputSchema.parse(document.extractedData);

  const row: DocumentReviewRowDraft = {
    description: null,
    quantity: 1,
    extractedFields: LABEL_FIELDS,
    values: {
      ...EMPTY_VALUES,
      category: extracted?.category ?? "",
      brand: extracted?.brand ?? "",
      model: extracted?.model ?? "",
      serialNumber: extracted?.serialNumber ?? "",
      manufactureDate: extracted?.manufactureDate ?? "",
    },
  };
  return {
    isExtracted: extracted !== null,
    shopName: null,
    purchaseDate: null,
    rows: [row],
  };
};

const buildInvoiceReview = (document: Readonly<{ extractedData: unknown }>) => {
  const extracted =
    document.extractedData === null
      ? null
      : invoiceExtractorOutputSchema.parse(document.extractedData);
  const purchaseDate = extracted?.purchaseDate ?? null;

  const rows = (extracted?.items ?? []).map((item): DocumentReviewRowDraft => ({
    description: item.description,
    quantity: item.quantity,
    extractedFields: INVOICE_FIELDS,
    values: {
      ...EMPTY_VALUES,
      category: item.category,
      brand: item.brand ?? "",
      model: item.model ?? "",
      purchaseDate: purchaseDate ?? "",
      purchasePriceRon: item.unitPriceRon?.toString() ?? "",
      warrantyUntil:
        purchaseDate && item.warrantyMonths !== null
          ? addMonthsToIsoDate(purchaseDate, item.warrantyMonths)
          : "",
    },
  }));

  return {
    isExtracted: extracted !== null,
    shopName: extracted?.shopName ?? null,
    purchaseDate,
    rows:
      rows.length > 0
        ? rows
        : [
            {
              description: null,
              quantity: 1,
              extractedFields: INVOICE_FIELDS,
              values: EMPTY_VALUES,
            },
          ],
  };
};
