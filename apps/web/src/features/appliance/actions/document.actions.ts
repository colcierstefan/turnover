"use server";

import { redirect } from "next/navigation";

import {
  documentIdInputSchema,
  saveDocumentReviewInputSchema,
  uploadDocumentInputSchema,
} from "@turnover/core/appliance/schemas/document.schema";
import documentService from "@turnover/core/appliance/services/document.service";
import { AppError } from "@turnover/core/lib/errors";
import userService from "@turnover/core/user/services/user.service";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";
import { getFormErrorMessage } from "@/features/user/server/user-form-error.server";
import { requireSignedInUser } from "@/features/user/server/user-session.server";

const REVIEW_ROW_FIELD_PATTERN = /^rows\.(\d+)\.(\w+)$/;

export async function uploadDocument(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = uploadDocumentInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  const documentId = await documentService.uploadDocument(user.id, parsed.data);
  redirect(`/units/${parsed.data.unitId}/documents/${documentId}/review`);
}

export async function saveDocumentReview(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = saveDocumentReviewInputSchema.safeParse({
    documentId: formData.get("documentId"),
    rows: groupReviewRows(formData),
  });
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  let unitId: string;
  try {
    const document = await documentService.saveDocumentReview(
      user.id,
      parsed.data,
    );
    unitId = document.unitId;
  } catch (error) {
    if (error instanceof AppError && error.reason) {
      return MANAGER_TEXT[user.language].userErrors[error.reason];
    }
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
