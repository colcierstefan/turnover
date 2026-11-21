"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  acceptInvitationInputSchema,
  createOrganizationInputSchema,
  inviteManagerInputSchema,
  removeManagerInputSchema,
} from "@/features/organization/schemas/organization.schema";
import { getInvitationUrl } from "@/features/organization/server/organization-invitation-link.server";
import organizationService from "@/features/organization/services/organization.service";
import userService from "@/features/user/services/user.service";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

type InviteManagerState =
  { error: string } | { email: string; invitationUrl: string } | null;

export async function createOrganization(
  _previousError: string | null,
  formData: FormData,
) {
  const parsed = createOrganizationInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await userService.requireCurrentUser();
  try {
    await organizationService.createOrganization(user.id, parsed.data);
  } catch (error) {
    if (error instanceof ValidationError) return error.message;
    throw error;
  }
  redirect("/units");
}

export async function inviteManager(
  _previousState: InviteManagerState,
  formData: FormData,
): Promise<InviteManagerState> {
  const parsed = inviteManagerInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await userService.requireCurrentUser();
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
    if (error instanceof ValidationError) return { error: error.message };
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
  const user = await userService.requireCurrentUser();
  try {
    await organizationService.acceptInvitation(user, input);
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof ForbiddenError ||
      error instanceof NotFoundError
    ) {
      return error.message;
    }
    throw error;
  }
  redirect("/units");
}
