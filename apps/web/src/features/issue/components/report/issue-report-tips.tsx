"use client";

import { useState, useTransition } from "react";

import { ISSUE_REPORT_TEXT } from "@turnover/core/issue/constants/issue-report-text.constants";
import type { ReporterLanguage } from "@turnover/core/issue/constants/issue.constants";

import Button from "@/components/button";
import {
  markIssueFixed,
  markIssueStillBroken,
} from "@/features/issue/actions/issue-report.actions";

export default function IssueReportTips({
  reportToken,
  language,
  issueId,
  tips,
  onFixed,
  onStillBroken,
}: Readonly<{
  reportToken: string;
  language: ReporterLanguage;
  issueId: string;
  tips: ReadonlyArray<string>;
  onFixed: () => void;
  onStillBroken: () => void;
}>) {
  const text = ISSUE_REPORT_TEXT[language];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{text.tipsTitle}</h2>
      <p className="text-sm opacity-70">{text.tipsIntro}</p>
      <ol className="flex list-decimal flex-col gap-2 pl-5">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ol>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await markIssueFixed({ reportToken, issueId });
              onFixed();
            } catch {
              setError(text.stepFailed);
            }
          })
        }
      >
        {text.fixed}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await markIssueStillBroken({ reportToken, issueId });
              onStillBroken();
            } catch {
              setError(text.stepFailed);
            }
          })
        }
      >
        {text.stillBroken}
      </Button>
    </div>
  );
}
