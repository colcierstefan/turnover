import { z } from "zod";

import { MAX_UPLOAD_BYTES } from "@turnover/core/appliance/constants/appliance.constants";
import { applianceFieldsSchema } from "@turnover/core/appliance/schemas/appliance.schema";
import { invoiceExtractionInputSchema } from "@turnover/core/appliance/schemas/invoice-extraction.schema";
import { labelExtractionInputSchema } from "@turnover/core/appliance/schemas/label-extraction.schema";

const uploadFileSchema = (contentTypeSchema: z.ZodType) =>
  z
    .instanceof(File)
    .refine((file) => file.size > 0)
    .refine((file) => file.size <= MAX_UPLOAD_BYTES)
    .refine((file) => contentTypeSchema.safeParse(file.type).success);

export const uploadDocumentInputSchema = z.discriminatedUnion("kind", [
  z.object({
    unitId: z.uuid(),
    kind: z.literal("LABEL_PHOTO"),
    file: uploadFileSchema(labelExtractionInputSchema.shape.contentType),
  }),
  z.object({
    unitId: z.uuid(),
    kind: z.literal("INVOICE"),
    file: uploadFileSchema(invoiceExtractionInputSchema.shape.contentType),
  }),
]);
export type UploadDocumentInput = z.infer<typeof uploadDocumentInputSchema>;

export const documentReviewRowSchema = applianceFieldsSchema.extend({
  count: z.coerce.number().int().min(1).max(20),
});
export type DocumentReviewRow = z.infer<typeof documentReviewRowSchema>;

export const saveDocumentReviewInputSchema = z.object({
  documentId: z.uuid(),
  rows: z.array(documentReviewRowSchema).min(1),
});
export type SaveDocumentReviewInput = z.infer<
  typeof saveDocumentReviewInputSchema
>;

export const documentIdInputSchema = z.object({
  documentId: z.uuid(),
});
export type DocumentIdInput = z.infer<typeof documentIdInputSchema>;
