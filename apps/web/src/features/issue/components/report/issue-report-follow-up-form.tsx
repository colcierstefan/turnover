"use client";

import { useActionState } from "react";

import { ISSUE_REPORT_TEXT } from "@turnover/core/issue/constants/issue-report-text.constants";
import type { ReporterLanguage } from "@turnover/core/issue/constants/issue.constants";
import type { IssueReportStep } from "@turnover/core/issue/types/issue-report.types";

import Button from "@/components/button";
import Input from "@/components/input";
import { answerIssueFollowUps } from "@/features/issue/actions/issue-report.actions";

export default function IssueReportFollowUpForm({
  reportToken,
  language,
  issueId,
  followUps,
  onStep,
}: Readonly<{
  reportToken: string;
  language: ReporterLanguage;
  issueId: string;
  followUps: ReadonlyArray<{ id: string; question: string }>;
  onStep: (step: IssueReportStep) => void;
}>) {
  const text = ISSUE_REPORT_TEXT[language];
  const [error, formAction, isPending] = useActionState(
    async (_previousError: string | null, formData: FormData) => {
      try {
        const result = await answerIssueFollowUps({
          reportToken,
          issueId,
          answers: followUps.map((followUp) => ({
            followUpId: followUp.id,
            answer: formData.get(followUp.id),
          })),
        });
        if ("error" in result) return text.stepFailed;
        onStep(result.step);
        return null;
      } catch {
        return text.stepFailed;
      }
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{text.followUpsTitle}</h2>
      <p className="text-sm opacity-70">{text.followUpsIntro}</p>
      {followUps.map((followUp) => (
        <Input
          key={followUp.id}
          label={followUp.question}
          name={followUp.id}
          placeholder={text.answerPlaceholder}
          maxLength={1000}
        />
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? text.sending : text.continue}
      </Button>
    </form>
  );
}
