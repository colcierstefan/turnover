"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  createHandymanInputSchema,
  draftHandymanMessageInputSchema,
  handymanIdInputSchema,
  recordHandymanMessageInputSchema,
  saveRecipientAsHandymanInputSchema,
  translateHandymanMessageInputSchema,
  updateHandymanInputSchema,
} from "@turnover/core/handyman/schemas/handyman.schema";
import handymanService from "@turnover/core/handyman/services/handyman.service";
import { AppError } from "@turnover/core/lib/errors";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";
import { getFormErrorMessage } from "@/features/user/server/user-form-error.server";
import { requireSignedInUser } from "@/features/user/server/user-session.server";

export async function createHandyman(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = createHandymanInputSchema.safeParse(
    readHandymanForm(formData),
  );
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  return runWithUserError(user.language, async () => {
    await handymanService.createHandyman(user.id, parsed.data);
    refresh();
  });
}

export async function updateHandyman(
  _previousState: { error: string } | { isSaved: true } | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = updateHandymanInputSchema.safeParse(
    readHandymanForm(formData),
  );
  if (!parsed.success) {
    return { error: getFormErrorMessage(user.language, parsed.error) };
  }

  const error = await runWithUserError(user.language, async () => {
    await handymanService.updateHandyman(user.id, parsed.data);
    refresh();
  });
  return error ? { error } : { isSaved: true as const };
}

export async function deleteHandyman(input: unknown) {
  const { handymanId } = handymanIdInputSchema.parse(input);
  const user = await requireSignedInUser();
  await handymanService.deleteHandyman(user.id, handymanId);
  redirect("/handymen");
}

export async function draftHandymanMessage(input: unknown) {
  const parsed = draftHandymanMessageInputSchema.parse(input);
  const user = await requireSignedInUser();
  return handymanService.draftMessage(user, parsed);
}

export async function translateHandymanMessage(input: unknown) {
  const parsed = translateHandymanMessageInputSchema.parse(input);
  const user = await requireSignedInUser();
  return handymanService.translateMessage(user.id, parsed);
}

export async function recordHandymanMessage(input: unknown) {
  const parsed = recordHandymanMessageInputSchema.parse(input);
  const user = await requireSignedInUser();
  const message = await handymanService.recordMessageOpened(user.id, parsed);
  refresh();
  return message;
}

export async function saveRecipientAsHandyman(
  _previousState: { error: string } | { isSaved: true } | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = saveRecipientAsHandymanInputSchema.safeParse(
    readHandymanForm(formData),
  );
  if (!parsed.success) {
    return { error: getFormErrorMessage(user.language, parsed.error) };
  }

  const error = await runWithUserError(user.language, async () => {
    await handymanService.saveRecipientAsHandyman(user.id, parsed.data);
    refresh();
  });
  return error ? { error } : { isSaved: true as const };
}

const readHandymanForm = (formData: FormData) => ({
  ...Object.fromEntries(formData),
  trades: formData.getAll("trades"),
});

const runWithUserError = async (
  language: UserLanguage,
  run: () => Promise<void>,
) => {
  try {
    await run();
    return null;
  } catch (error) {
    if (error instanceof AppError && error.reason) {
      return MANAGER_TEXT[language].userErrors[error.reason];
    }
    throw error;
  }
};
