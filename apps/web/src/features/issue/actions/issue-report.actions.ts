"use server";

import { cookies } from "next/headers";
import { after } from "next/server";

import {
  answerIssueFollowUpsInputSchema,
  reportedIssueInputSchema,
  reporterLanguageSchema,
  submitIssueReportInputSchema,
} from "@turnover/core/issue/schemas/issue.schema";
import issueService from "@turnover/core/issue/services/issue.service";
import type { IssueReportStep } from "@turnover/core/issue/types/issue-report.types";
import { TooManyRequestsError } from "@turnover/core/lib/errors";

import { REPORTER_LANGUAGE_COOKIE } from "@/features/issue/server/issue-report-language.server";

const REPORTER_LANGUAGE_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

type IssueReportActionResult =
  { step: IssueReportStep } | { error: "TOO_MANY_REPORTS" | "FAILED" };

export async function submitIssueReport(
  formData: FormData,
): Promise<IssueReportActionResult> {
  const parsed = submitIssueReportInputSchema.safeParse({
    ...Object.fromEntries(formData),
    photos: formData
      .getAll("photos")
      .filter((photo) => photo instanceof File && photo.size > 0),
  });
  if (!parsed.success) return { error: "FAILED" };

  try {
    return {
      step: diagnoseWhenFinished(await issueService.submitReport(parsed.data)),
    };
  } catch (error) {
    if (error instanceof TooManyRequestsError) {
      return { error: "TOO_MANY_REPORTS" };
    }
    throw error;
  }
}

export async function answerIssueFollowUps(
  input: unknown,
): Promise<IssueReportActionResult> {
  const parsed = answerIssueFollowUpsInputSchema.safeParse(input);
  if (!parsed.success) return { error: "FAILED" };
  return {
    step: diagnoseWhenFinished(await issueService.answerFollowUps(parsed.data)),
  };
}

export async function markIssueFixed(input: unknown) {
  await issueService.markFixedByReporter(reportedIssueInputSchema.parse(input));
}

export async function markIssueStillBroken(input: unknown) {
  const parsed = reportedIssueInputSchema.parse(input);
  await issueService.confirmStillBrokenByReporter(parsed);
  after(() => issueService.diagnoseReportedIssue(parsed.issueId));
}

export async function chooseReporterLanguage(input: unknown) {
  const language = reporterLanguageSchema.parse(input);
  (await cookies()).set(REPORTER_LANGUAGE_COOKIE, language, {
    path: "/r",
    maxAge: REPORTER_LANGUAGE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
}

const diagnoseWhenFinished = (step: IssueReportStep) => {
  if (step.step === "SENT" || step.step === "EMERGENCY") {
    after(() => issueService.diagnoseReportedIssue(step.issueId));
  }
  return step;
};
