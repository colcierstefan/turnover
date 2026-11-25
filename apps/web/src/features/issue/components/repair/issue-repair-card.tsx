import Link from "next/link";

import type { ApplianceCategory } from "@turnover/core/appliance/constants/appliance.constants";
import type {
  IssueResolution,
  IssueStatus,
  ReporterRole,
} from "@turnover/core/issue/constants/issue.constants";
import type { StoredIssueDiagnosis } from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";
import { toIsoDate } from "@turnover/core/utils/date.utils";

import Card from "@/components/card";
import IssueCloseForm from "@/features/issue/components/repair/issue-close-form";
import IssueReopenButton from "@/features/issue/components/repair/issue-reopen-button";
import IssueScheduleForm from "@/features/issue/components/repair/issue-schedule-form";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueRepairCard({
  issue,
  handymen,
  lastMessagedHandymanId,
  language,
}: Readonly<{
  issue: Readonly<{
    id: string;
    unitId: string;
    status: IssueStatus;
    reporterRole: ReporterRole;
    scheduledFor: Date | null;
    scheduledTime: string | null;
    resolution: IssueResolution | null;
    costRon: number | null;
    costNote: string | null;
    resolvedByHandymanId: string | null;
    resolvedAt: Date | null;
    diagnosis: StoredIssueDiagnosis | null;
    appliance: Readonly<{
      category: ApplianceCategory;
      brand: string | null;
      model: string | null;
      retiredAt: Date | null;
    }> | null;
  }>;
  handymen: ReadonlyArray<{ id: string; name: string }>;
  lastMessagedHandymanId: string | null;
  language: UserLanguage;
}>) {
  const {
    locale,
    repair: text,
    issues: issuesText,
    appliance: applianceText,
  } = MANAGER_TEXT[language];
  const visitDateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const resolvedAtFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Europe/Bucharest",
  });
  const ronFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    trailingZeroDisplay: "stripIfInteger",
  });
  const { appliance, diagnosis } = issue;

  if (issue.status === "RESOLVED" && issue.resolution && issue.resolvedAt) {
    const fixedBy =
      issue.resolution === "FIXED_BY_REPORTER"
        ? issuesText.reporterRoles[issue.reporterRole]
        : handymen.find(({ id }) => id === issue.resolvedByHandymanId)?.name;
    return (
      <Card title={text.title}>
        <p className="font-medium">
          {text.closedOn(resolvedAtFormat.format(issue.resolvedAt))} ·{" "}
          {text.resolutions[issue.resolution]}
        </p>
        <dl className="flex flex-col gap-1 text-sm">
          {issue.costRon !== null && (
            <div className="flex justify-between gap-4">
              <dt>{text.finalCostLabel}</dt>
              <dd className="font-medium">
                {text.amountRon(ronFormat.format(issue.costRon))}
              </dd>
            </div>
          )}
          {fixedBy && (
            <div className="flex justify-between gap-4">
              <dt>{text.fixedByLabel}</dt>
              <dd className="text-right">{fixedBy}</dd>
            </div>
          )}
          {issue.costNote && (
            <div className="flex flex-col">
              <dt>{text.noteLabel}</dt>
              <dd className="whitespace-pre-line opacity-70">
                {issue.costNote}
              </dd>
            </div>
          )}
        </dl>
        {issue.resolution === "REPLACED" && (
          <Link
            href={`/units/${issue.unitId}/appliances/new`}
            className="rounded bg-foreground px-4 py-2 text-center font-medium text-background"
          >
            {text.addNewAppliance}
          </Link>
        )}
        <IssueReopenButton issueId={issue.id} language={language} />
      </Card>
    );
  }

  return (
    <Card title={text.title}>
      {issue.status === "SCHEDULED" && issue.scheduledFor && (
        <p className="font-medium">
          {issuesText.visitOn(
            visitDateFormat.format(issue.scheduledFor),
            issue.scheduledTime,
          )}
        </p>
      )}
      <details className="flex flex-col gap-4">
        <summary className="cursor-pointer font-medium">
          {text.scheduleTitle}
        </summary>
        <div className="pt-4">
          <IssueScheduleForm
            issueId={issue.id}
            scheduledFor={issue.scheduledFor && toIsoDate(issue.scheduledFor)}
            scheduledTime={issue.scheduledTime}
            language={language}
          />
        </div>
      </details>
      <details className="flex flex-col gap-4">
        <summary className="cursor-pointer font-medium">
          {text.closeTitle}
        </summary>
        <div className="pt-4">
          <IssueCloseForm
            issueId={issue.id}
            applianceName={
              appliance && !appliance.retiredAt
                ? [
                    applianceText.categories[appliance.category],
                    appliance.brand,
                    appliance.model,
                  ]
                    .filter(Boolean)
                    .join(" ")
                : null
            }
            repairEstimateRon={
              diagnosis &&
              sumCostRanges([diagnosis.partCostRon, diagnosis.labourCostRon])
            }
            newApplianceEstimateRon={diagnosis?.newApplianceCostRon ?? null}
            handymen={handymen}
            lastMessagedHandymanId={lastMessagedHandymanId}
            language={language}
          />
        </div>
      </details>
    </Card>
  );
}

function sumCostRanges(
  ranges: ReadonlyArray<StoredIssueDiagnosis["partCostRon"]>,
) {
  const present = ranges.filter((range) => range !== null);
  if (present.length === 0) return null;
  return {
    minRon: present.reduce((total, range) => total + range.minRon, 0),
    maxRon: present.reduce((total, range) => total + range.maxRon, 0),
  };
}
