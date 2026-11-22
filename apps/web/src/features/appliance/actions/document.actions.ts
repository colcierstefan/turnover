"use server";

import { redirect } from "next/navigation";

import {
  documentIdInputSchema,
  saveDocumentReviewInputSchema,
  uploadDocumentInputSchema,
} from "@turnover/core/appliance/schemas/document.schema";
import documentService from "@turnover/core/appliance/services/document.service";
import { ValidationError } from "@turnover/core/lib/errors";
import userService from "@turnover/core/user/services/user.service";

const REVIEW_ROW_FIELD_PATTERN = /^rows\.(\d+)\.(\w+)$/;

export async function uploadDocument(
  _previousError: string | null,
  formData: FormData,
) {
  const parsed = uploadDocumentInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await userService.requireCurrentUser();
  const documentId = await documentService.uploadDocument(user.id, parsed.data);
  redirect(`/units/${parsed.data.unitId}/documents/${documentId}/review`);
}

export async function saveDocumentReview(
  _previousError: string | null,
  formData: FormData,
) {
  const parsed = saveDocumentReviewInputSchema.safeParse({
    documentId: formData.get("documentId"),
    rows: groupReviewRows(formData),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await userService.requireCurrentUser();
  let unitId: string;
  try {
    const document = await documentService.saveDocumentReview(
      user.id,
      parsed.data,
    );
    unitId = document.unitId;
  } catch (error) {
    if (error instanceof ValidationError) return error.message;
    throw error;
  }
  redirect(`/units/${unitId}`);
}

export async function discardDocument(input: unknown) {
  const { documentId } = documentIdInputSchema.parse(input);
  const user = await userService.requireCurrentUser();
  const document = await documentService.discardDocument(user.id, documentId);
  redirect(`/units/${document.unitId}`);
}

const groupReviewRows = (formData: FormData) => {
  const rows: Record<string, string>[] = [];
  for (const [key, value] of formData) {
    const match = REVIEW_ROW_FIELD_PATTERN.exec(key);
    if (!match || typeof value !== "string") continue;
    const index = Number(match[1]);
    rows[index] = { ...rows[index], [match[2]]: value };
  }
  return rows.filter((row) => row !== undefined);
};
