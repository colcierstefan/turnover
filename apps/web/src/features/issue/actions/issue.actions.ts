"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import {
  changeIssueApplianceInputSchema,
  closeIssueInputSchema,
  issueIdInputSchema,
  reportIssueAsManagerInputSchema,
  scheduleIssueVisitInputSchema,
} from "@turnover/core/issue/schemas/issue.schema";
import issueService from "@turnover/core/issue/services/issue.service";

import { getFormErrorMessage } from "@/features/user/server/user-form-error.server";
import { requireSignedInUser } from "@/features/user/server/user-session.server";

export async function reportIssue(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = reportIssueAsManagerInputSchema.safeParse({
    ...Object.fromEntries(formData),
    photos: formData
      .getAll("photos")
      .filter((photo) => photo instanceof File && photo.size > 0),
  });
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  const issue = await issueService.reportIssueAsManager(user, parsed.data);
  redirect(`/units/${issue.unitId}/issues/${issue.id}`);
}

export async function diagnoseIssue(input: unknown) {
  const { issueId } = issueIdInputSchema.parse(input);
  const user = await requireSignedInUser();
  await issueService.diagnoseIssue(user, issueId);
  refresh();
}

export async function changeIssueAppliance(input: unknown) {
  const parsed = changeIssueApplianceInputSchema.parse(input);
  const user = await requireSignedInUser();
  await issueService.changeIssueAppliance(user.id, parsed);
  refresh();
}

export async function scheduleIssueVisit(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = scheduleIssueVisitInputSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  await issueService.scheduleVisit(user.id, parsed.data);
  refresh();
  return null;
}

export async function closeIssue(
  _previousError: string | null,
  formData: FormData,
) {
  const user = await requireSignedInUser();
  const parsed = closeIssueInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return getFormErrorMessage(user.language, parsed.error);

  await issueService.closeIssue(user.id, parsed.data);
  refresh();
  return null;
}

export async function reopenIssue(input: unknown) {
  const { issueId } = issueIdInputSchema.parse(input);
  const user = await requireSignedInUser();
  await issueService.reopenIssue(user.id, issueId);
  refresh();
}
