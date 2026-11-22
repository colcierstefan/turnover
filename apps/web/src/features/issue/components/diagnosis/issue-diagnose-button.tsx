"use client";

import { useState, useTransition } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { diagnoseIssue } from "@/features/issue/actions/issue.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueDiagnoseButton({
  issueId,
  isDiagnosed,
  language,
}: Readonly<{
  issueId: string;
  isDiagnosed: boolean;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].issue;
  const [isPending, startTransition] = useTransition();
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <>
      {hasFailed && (
        <p className="text-sm text-red-600">{text.diagnoseFailed}</p>
      )}
      <Button
        type="button"
        variant={isDiagnosed ? "secondary" : "primary"}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setHasFailed(false);
            try {
              await diagnoseIssue({ issueId });
            } catch {
              setHasFailed(true);
            }
          })
        }
      >
        {isPending
          ? text.diagnosing
          : isDiagnosed
            ? text.diagnoseAgain
            : text.diagnose}
      </Button>
    </>
  );
}
