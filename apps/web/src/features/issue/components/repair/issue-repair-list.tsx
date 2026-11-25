import Link from "next/link";

import type { ApplianceCategory } from "@turnover/core/appliance/constants/appliance.constants";
import type {
  IssueResolution,
  ReporterRole,
} from "@turnover/core/issue/constants/issue.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueRepairList({
  repairs,
  showUnit,
  language,
}: Readonly<{
  repairs: ReadonlyArray<{
    id: string;
    unitId: string;
    unit: Readonly<{ name: string }>;
    appliance: Readonly<{
      category: ApplianceCategory;
      brand: string | null;
      model: string | null;
    }> | null;
    reporterRole: ReporterRole;
    resolution: IssueResolution | null;
    resolvedAt: Date | null;
    resolvedByHandyman: Readonly<{ name: string }> | null;
    costRon: number | null;
    costNote: string | null;
  }>;
  showUnit: boolean;
  language: UserLanguage;
}>) {
  const {
    locale,
    repair: text,
    issues: issuesText,
    appliance: applianceText,
  } = MANAGER_TEXT[language];
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Europe/Bucharest",
  });
  const ronFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    trailingZeroDisplay: "stripIfInteger",
  });

  if (repairs.length === 0) {
    return <p className="text-sm opacity-70">{text.historyEmpty}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {repairs.map((repair) => {
        const fixedBy =
          repair.resolution === "FIXED_BY_REPORTER"
            ? issuesText.reporterRoles[repair.reporterRole]
            : repair.resolvedByHandyman?.name;
        return (
          <li key={repair.id}>
            <Link
              href={`/units/${repair.unitId}/issues/${repair.id}`}
              className="flex flex-col gap-1 py-3"
            >
              <span className="flex justify-between gap-4 text-sm">
                <span className="opacity-70">
                  {repair.resolvedAt && dateFormat.format(repair.resolvedAt)}
                </span>
                {repair.costRon !== null && (
                  <span className="font-medium">
                    {text.amountRon(ronFormat.format(repair.costRon))}
                  </span>
                )}
              </span>
              {showUnit && (
                <span className="text-sm font-medium">{repair.unit.name}</span>
              )}
              <span>
                {[
                  repair.appliance &&
                    [
                      applianceText.categories[repair.appliance.category],
                      repair.appliance.brand,
                      repair.appliance.model,
                    ]
                      .filter(Boolean)
                      .join(" "),
                  repair.resolution && text.resolutions[repair.resolution],
                ]
                  .filter(Boolean)
                  .join(": ")}
              </span>
              {repair.costNote && (
                <span className="line-clamp-2 text-sm opacity-70">
                  {repair.costNote}
                </span>
              )}
              {fixedBy && (
                <span className="text-sm opacity-70">
                  {text.fixedByLabel}: {fixedBy}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
