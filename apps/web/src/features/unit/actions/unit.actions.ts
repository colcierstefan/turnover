"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  createUnitInputSchema,
  unitIdInputSchema,
  updateUnitInputSchema,
} from "@turnover/core/unit/schemas/unit.schema";
import unitService from "@turnover/core/unit/services/unit.service";
import userService from "@turnover/core/user/services/user.service";

import { getFormErrorMessage } from "@/features/user/server/user-form-error.server";
import { requireSignedInUser } from "@/features/user/server/user-session.server";

export async function createUnit(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = createUnitInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  const unit = await unitService.createUnit(user.id, parsed.data);
  redirect(`/units/${unit.id}`);
}

export async function updateUnit(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = updateUnitInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  await unitService.updateUnit(user.id, parsed.data);
  refresh();
  return null;
}

export async function deleteUnit(input: unknown) {
  const { unitId } = unitIdInputSchema.parse(input);
  const user = await userService.requireCurrentUser();
  await unitService.deleteUnit(user.id, unitId);
  redirect("/units");
}

export async function regenerateReportToken(input: unknown) {
  const { unitId } = unitIdInputSchema.parse(input);
  const user = await userService.requireCurrentUser();
  await unitService.regenerateReportToken(user.id, unitId);
  refresh();
}
