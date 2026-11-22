import {
  EMERGENCY_TYPE_LABELS,
  REPORTER_ROLE_LABELS,
  type EmergencyType,
  type ReporterRole,
} from "@turnover/core/issue/constants/issue.constants";

const CREATED_AT_FORMAT = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
});

export default function IssueOpenList({
  issues,
}: Readonly<{
  issues: ReadonlyArray<{
    id: string;
    description: string;
    reporterRole: ReporterRole;
    reporterName: string | null;
    emergencyType: EmergencyType | null;
    createdAt: Date;
  }>;
}>) {
  if (issues.length === 0) {
    return <p className="text-sm opacity-70">No open issues.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {issues.map((issue) => (
        <li key={issue.id} className="flex flex-col gap-1 py-3">
          {issue.emergencyType && (
            <span className="self-start rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
              Emergency: {EMERGENCY_TYPE_LABELS[issue.emergencyType]}
            </span>
          )}
          <span className="line-clamp-3">{issue.description}</span>
          <span className="text-sm opacity-70">
            {[REPORTER_ROLE_LABELS[issue.reporterRole], issue.reporterName]
              .filter(Boolean)
              .join(", ")}{" "}
            · {CREATED_AT_FORMAT.format(issue.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
