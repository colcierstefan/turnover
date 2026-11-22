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

export async function createAppliance(
  _previousError: string | null,
  formData: FormData,
) {
  const parsed = createApplianceInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await userService.requireCurrentUser();
  await applianceService.createAppliance(user.id, parsed.data);
  redirect(`/units/${parsed.data.unitId}`);
}

export async function updateAppliance(
  _previousError: string | null,
  formData: FormData,
) {
  const parsed = updateApplianceInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return parsed.error.issues[0].message;

  const user = await userService.requireCurrentUser();
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
