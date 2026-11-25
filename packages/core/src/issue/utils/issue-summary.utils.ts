import { createHash } from "node:crypto";

import {
  ISSUE_SUMMARY_DESCRIPTION_MAX_LENGTH,
  ISSUE_SUMMARY_TIME_ZONE,
} from "@turnover/core/issue/constants/issue.constants";
import type issueRepository from "@turnover/core/issue/repositories/issue.repository";
import {
  storedIssueDiagnosisSchema,
  type CostRange,
} from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import type {
  IssueSummaryFacts,
  IssueSummaryOpenIssue,
  IssueSummaryRepeatProblem,
} from "@turnover/core/issue/schemas/issue-summary.schema";
import { toIsoDate } from "@turnover/core/utils/date.utils";

type OpenIssue = Awaited<
  ReturnType<typeof issueRepository.listOpenForSummaryByOrganizationId>
>[number];
type ClosedIssue = Awaited<
  ReturnType<
    typeof issueRepository.listResolvedApplianceIssuesSinceByOrganizationId
  >
>[number];
type ApplianceName = Readonly<{
  category: string;
  brand: string | null;
  model: string | null;
}>;

const DAY_MS = 24 * 60 * 60 * 1000;

export const buildIssueSummaryFacts = (
  openIssues: ReadonlyArray<OpenIssue>,
  closedIssues: ReadonlyArray<ClosedIssue>,
  now: Date,
): IssueSummaryFacts => {
  const today = toLocalIsoDate(now);
  return {
    openIssues: openIssues.map((issue) => toOpenIssueFacts(issue, today)),
    repeatProblems: toRepeatProblems(openIssues, closedIssues),
  };
};

export const getIssueSummaryFactsFingerprint = (facts: IssueSummaryFacts) =>
  createHash("sha256").update(JSON.stringify(facts)).digest("hex");

const toLocalIsoDate = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ISSUE_SUMMARY_TIME_ZONE,
  }).format(date);

const toOpenIssueFacts = (
  issue: OpenIssue,
  today: string,
): IssueSummaryOpenIssue => {
  const diagnosis = storedIssueDiagnosisSchema
    .nullable()
    .parse(issue.diagnosis);
  const lastMessage = issue.handymanMessages.at(0);
  return {
    id: issue.id,
    unitName: issue.unit.name,
    appliance: issue.appliance && formatAppliance(issue.appliance),
    description: issue.description.slice(
      0,
      ISSUE_SUMMARY_DESCRIPTION_MAX_LENGTH,
    ),
    status: issue.status,
    daysOpen: countDays(toLocalIsoDate(issue.createdAt), today),
    emergencyType: issue.emergencyType,
    visit:
      issue.status === "SCHEDULED" && issue.scheduledFor
        ? {
            inDays: countDays(today, toIsoDate(issue.scheduledFor)),
            time: issue.scheduledTime,
          }
        : null,
    category: issue.category,
    trade: diagnosis?.trade ?? null,
    repairEstimateRon: addRanges(
      diagnosis?.partCostRon ?? null,
      diagnosis?.labourCostRon ?? null,
    ),
    newApplianceEstimateRon: diagnosis?.newApplianceCostRon ?? null,
    handymanMessagedDaysAgo: lastMessage
      ? countDays(toLocalIsoDate(lastMessage.openedInWhatsAppAt), today)
      : null,
  };
};

const toRepeatProblems = (
  openIssues: ReadonlyArray<OpenIssue>,
  closedIssues: ReadonlyArray<ClosedIssue>,
): IssueSummaryRepeatProblem[] =>
  [...Map.groupBy(closedIssues, (issue) => issue.applianceId)].flatMap(
    ([applianceId, issues]) => {
      const { appliance, unit } = issues[0];
      if (!applianceId || !appliance || issues.length < 2) return [];
      return [
        {
          appliance: formatAppliance(appliance),
          unitName: unit.name,
          closedIssueCount: issues.length,
          repairCostRon: issues.reduce(
            (total, issue) => total + (issue.costRon?.toNumber() ?? 0),
            0,
          ),
          purchasePriceRon: appliance.purchasePriceRon?.toNumber() ?? null,
          closedIssueIds: issues.map((issue) => issue.id),
          openIssueIds: openIssues
            .filter((issue) => issue.applianceId === applianceId)
            .map((issue) => issue.id),
        },
      ];
    },
  );

const formatAppliance = (appliance: ApplianceName) =>
  [appliance.category, appliance.brand, appliance.model]
    .filter(Boolean)
    .join(" ");

const countDays = (fromDate: string, toDate: string) =>
  Math.round((Date.parse(toDate) - Date.parse(fromDate)) / DAY_MS);

const addRanges = (first: CostRange | null, second: CostRange | null) =>
  first || second
    ? {
        minRon: (first?.minRon ?? 0) + (second?.minRon ?? 0),
        maxRon: (first?.maxRon ?? 0) + (second?.maxRon ?? 0),
      }
    : null;
