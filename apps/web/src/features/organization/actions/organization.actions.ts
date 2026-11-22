"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { AppError } from "@turnover/core/lib/errors";
import {
  acceptInvitationInputSchema,
  createOrganizationInputSchema,
  inviteManagerInputSchema,
  removeManagerInputSchema,
  updateContactPhoneInputSchema,
} from "@turnover/core/organization/schemas/organization.schema";
import organizationService from "@turnover/core/organization/services/organization.service";
import userService from "@turnover/core/user/services/user.service";

import { getInvitationUrl } from "@/features/organization/server/organization-invitation-link.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";
import { getFormErrorMessage } from "@/features/user/server/user-form-error.server";
import { requireSignedInUser } from "@/features/user/server/user-session.server";

type InviteManagerState =
  { error: string } | { email: string; invitationUrl: string } | null;

export async function createOrganization(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = createOrganizationInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  try {
    await organizationService.createOrganization(user.id, parsed.data);
  } catch (error) {
    if (error instanceof AppError && error.reason) {
      return MANAGER_TEXT[user.language].userErrors[error.reason];
    }
    throw error;
  }
  redirect("/units");
}

export async function updateContactPhone(
  _previousState: { error: string } | { isSaved: true } | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = updateContactPhoneInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: getFormErrorMessage(user.language, parsed.error) };
  }

  await organizationService.updateContactPhone(user.id, parsed.data);
  refresh();
  return { isSaved: true as const };
}

export async function inviteManager(
  _previousState: InviteManagerState,
  formData: FormData,
): Promise<InviteManagerState> {
  const user = await requireSignedInUser();
  const parsed = inviteManagerInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: getFormErrorMessage(user.language, parsed.error) };
  }

  try {
    const invitation = await organizationService.inviteManager(
      user.id,
      parsed.data,
    );
    refresh();
    return {
      email: invitation.email,
      invitationUrl: getInvitationUrl(invitation.token),
    };
  } catch (error) {
    if (error instanceof AppError && error.reason) {
      return { error: MANAGER_TEXT[user.language].userErrors[error.reason] };
    }
    throw error;
  }
}

export async function removeManager(formData: FormData) {
  const input = removeManagerInputSchema.parse(Object.fromEntries(formData));
  const user = await userService.requireCurrentUser();
  await organizationService.removeManager(user.id, input);
  refresh();
}

export async function acceptInvitation(
  _previousError: string | null,
  formData: FormData,
) {
  const input = acceptInvitationInputSchema.parse(Object.fromEntries(formData));
  const user = await requireSignedInUser();
  try {
    await organizationService.acceptInvitation(user, input);
  } catch (error) {
    if (error instanceof AppError && error.reason) {
      return MANAGER_TEXT[user.language].userErrors[error.reason];
    }
    throw error;
  }
  redirect("/units");
}
