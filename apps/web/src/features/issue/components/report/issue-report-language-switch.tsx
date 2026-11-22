"use client";

import { useTransition } from "react";

import type { ReporterLanguage } from "@turnover/core/issue/constants/issue.constants";

import { chooseReporterLanguage } from "@/features/issue/actions/issue-report.actions";

const LANGUAGES: ReadonlyArray<ReporterLanguage> = ["EN", "RO"];

export default function IssueReportLanguageSwitch({
  language,
}: Readonly<{ language: ReporterLanguage }>) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-1 self-end text-xs">
      {LANGUAGES.map((option) => (
        <button
          key={option}
          type="button"
          disabled={isPending || option === language}
          aria-pressed={option === language}
          onClick={() => startTransition(() => chooseReporterLanguage(option))}
          className="rounded px-2 py-1 opacity-50 aria-pressed:font-semibold aria-pressed:opacity-100"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
