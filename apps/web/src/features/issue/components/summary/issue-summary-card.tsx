import Link from "next/link";

import type issueService from "@turnover/core/issue/services/issue.service";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default async function IssueSummaryCard({
  summary,
  language,
}: Readonly<{
  summary: ReturnType<typeof issueService.getIssueSummary>;
  language: UserLanguage;
}>) {
  const resolvedSummary = await summary;
  if (!resolvedSummary) return null;
  const text = MANAGER_TEXT[language].issues;

  return (
    <section className="flex flex-col gap-3 rounded border border-foreground/20 p-4">
      <h2 className="text-sm font-medium opacity-70">{text.summaryTitle}</h2>
      <p className="font-medium">{resolvedSummary.headline}</p>
      <ol className="flex list-decimal flex-col gap-3 pl-5">
        {resolvedSummary.points.map((point) => (
          <li key={point.text}>
            <p>{point.text}</p>
            <span className="mt-1 flex flex-wrap gap-2">
              {point.issues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/units/${issue.unitId}/issues/${issue.id}`}
                  className="rounded border border-foreground/20 px-2 py-0.5 text-xs underline"
                >
                  {issue.unitName}
                </Link>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
