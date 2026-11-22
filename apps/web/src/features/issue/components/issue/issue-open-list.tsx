import type {
  EmergencyType,
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
    description: string;
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
        <li key={issue.id} className="flex flex-col gap-1 py-3">
          {issue.emergencyType && (
            <span className="self-start rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
              {text.emergency(text.emergencyTypes[issue.emergencyType])}
            </span>
          )}
          <span className="line-clamp-3">{issue.description}</span>
          <span className="text-sm opacity-70">
            {[text.reporterRoles[issue.reporterRole], issue.reporterName]
              .filter(Boolean)
              .join(", ")}{" "}
            · {createdAtFormat.format(issue.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
