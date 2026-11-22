import Link from "next/link";

import type {
  EmergencyType,
  IssueStatus,
  ReporterRole,
} from "@turnover/core/issue/constants/issue.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueOpenList({
  issues,
  language,
}: Readonly<{
  issues: ReadonlyArray<{
    id: string;
    unitId: string;
    unit?: Readonly<{ name: string }>;
    description: string;
    status: IssueStatus;
    reporterRole: ReporterRole;
    reporterName: string | null;
    emergencyType: EmergencyType | null;
    createdAt: Date;
  }>;
  language: UserLanguage;
}>) {
  const { locale, issues: text } = MANAGER_TEXT[language];
  const createdAtFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Bucharest",
  });

  if (issues.length === 0) {
    return <p className="text-sm opacity-70">{text.empty}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {issues.map((issue) => (
        <li key={issue.id}>
          <Link
            href={`/units/${issue.unitId}/issues/${issue.id}`}
            className="flex flex-col gap-1 py-3"
          >
            <span className="flex flex-wrap gap-2">
              {issue.emergencyType && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                  {text.emergency(text.emergencyTypes[issue.emergencyType])}
                </span>
              )}
              <span className="rounded border border-foreground/20 px-2 py-0.5 text-xs">
                {text.statuses[issue.status]}
              </span>
            </span>
            {issue.unit && (
              <span className="text-sm font-medium">{issue.unit.name}</span>
            )}
            <span className="line-clamp-3">{issue.description}</span>
            <span className="text-sm opacity-70">
              {[text.reporterRoles[issue.reporterRole], issue.reporterName]
                .filter(Boolean)
                .join(", ")}{" "}
              · {createdAtFormat.format(issue.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
