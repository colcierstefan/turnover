"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  applianceIdInputSchema,
  createApplianceInputSchema,
  updateApplianceInputSchema,
} from "@turnover/core/appliance/schemas/appliance.schema";
import applianceService from "@turnover/core/appliance/services/appliance.service";
import userService from "@turnover/core/user/services/user.service";

import { getFormErrorMessage } from "@/features/user/server/user-form-error.server";
import { requireSignedInUser } from "@/features/user/server/user-session.server";

export async function createAppliance(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = createApplianceInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  await applianceService.createAppliance(user.id, parsed.data);
  redirect(`/units/${parsed.data.unitId}`);
}

export async function updateAppliance(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = updateApplianceInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  await applianceService.updateAppliance(user.id, parsed.data);
  refresh();
  return null;
}

export async function deleteAppliance(input: unknown) {
  const { applianceId } = applianceIdInputSchema.parse(input);
  const user = await userService.requireCurrentUser();
  const appliance = await applianceService.deleteAppliance(
    user.id,
    applianceId,
  );
  redirect(`/units/${appliance.unitId}`);
}
