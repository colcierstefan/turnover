"use client";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import ConfirmButton from "@/components/confirm-button";
import { reopenIssue } from "@/features/issue/actions/issue.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueReopenButton({
  issueId,
  language,
}: Readonly<{ issueId: string; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].repair;

  return (
    <ConfirmButton
      variant="secondary"
      confirmMessage={text.reopenConfirm}
      onConfirm={() => reopenIssue({ issueId })}
    >
      {text.reopen}
    </ConfirmButton>
  );
}
