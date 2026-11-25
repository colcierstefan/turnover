"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { scheduleIssueVisit } from "@/features/issue/actions/issue.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueScheduleForm({
  issueId,
  scheduledFor,
  scheduledTime,
  language,
}: Readonly<{
  issueId: string;
  scheduledFor: string | null;
  scheduledTime: string | null;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].repair;
  const [error, formAction, isPending] = useActionState(
    scheduleIssueVisit,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="issueId" value={issueId} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={text.visitDateLabel}
          name="scheduledFor"
          type="date"
          defaultValue={scheduledFor ?? ""}
          required
        />
        <Input
          label={text.visitTimeLabel}
          name="scheduledTime"
          type="time"
          defaultValue={scheduledTime ?? ""}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="secondary" disabled={isPending}>
        {text.saveVisit}
      </Button>
    </form>
  );
}
