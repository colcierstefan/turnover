import { z } from "zod";

import { invoiceExtractorInputSchema } from "@/agents/invoice-extractor/schemas/invoice-extractor.schema";
import { labelExtractorInputSchema } from "@/agents/label-extractor/schemas/label-extractor.schema";
import { MAX_UPLOAD_BYTES } from "@/features/appliance/constants/appliance.constants";
import { applianceFieldsSchema } from "@/features/appliance/schemas/appliance.schema";

const uploadFileSchema = (contentTypeSchema: z.ZodType) =>
  z
    .instanceof(File, { message: "Choose a file" })
    .refine((file) => file.size > 0, "Choose a file")
    .refine((file) => file.size <= MAX_UPLOAD_BYTES, "The file is over 10 MB")
    .refine(
      (file) => contentTypeSchema.safeParse(file.type).success,
      "This file type is not supported",
    );

export const uploadDocumentInputSchema = z.discriminatedUnion("kind", [
  z.object({
    unitId: z.uuid(),
    kind: z.literal("LABEL_PHOTO"),
    file: uploadFileSchema(labelExtractorInputSchema.shape.contentType),
  }),
  z.object({
    unitId: z.uuid(),
    kind: z.literal("INVOICE"),
    file: uploadFileSchema(invoiceExtractorInputSchema.shape.contentType),
  }),
]);
export type UploadDocumentInput = z.infer<typeof uploadDocumentInputSchema>;

export const documentReviewRowSchema = applianceFieldsSchema.extend({
  count: z.coerce.number().int().min(1, "Add at least 1").max(20),
});
export type DocumentReviewRow = z.infer<typeof documentReviewRowSchema>;

export const saveDocumentReviewInputSchema = z.object({
  documentId: z.uuid(),
  rows: z
    .array(documentReviewRowSchema)
    .min(1, "Choose at least one appliance, or discard the upload"),
});
export type SaveDocumentReviewInput = z.infer<
  typeof saveDocumentReviewInputSchema
>;

export const documentIdInputSchema = z.object({
  documentId: z.uuid(),
});
export type DocumentIdInput = z.infer<typeof documentIdInputSchema>;
