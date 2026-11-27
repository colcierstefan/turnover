import {
  ISSUE_QUERY_TIME_ZONE,
  type RepairCostGrouping,
} from "@turnover/core/issue/constants/issue.constants";
import type issueRepository from "@turnover/core/issue/repositories/issue.repository";
import type { IssueListFilters } from "@turnover/core/issue/schemas/issue.schema";
import {
  countDaysBetween,
  toIsoDate,
  toZonedIsoDate,
} from "@turnover/core/utils/date.utils";

type QueriedIssue = Awaited<
  ReturnType<typeof issueRepository.listForQueryByOrganizationId>
>[number];
export type IssueListItem = ReturnType<typeof toIssueListItem>;
type RepairCostGroup = Readonly<{ id: string | null; label: string | null }>;

export const filterIssues = (
  issues: ReadonlyArray<QueriedIssue>,
  filters: IssueListFilters,
  today: string,
) =>
  issues
    .map((issue) => toIssueListItem(issue, today))
    .filter((issue) => matchesFilters(issue, filters));

export const sumRepairCosts = (
  issues: ReadonlyArray<IssueListItem>,
  groupBy: RepairCostGrouping | undefined,
) => {
  const repairs = issues.filter((issue) => issue.status === "RESOLVED");
  return {
    ...sumCosts(repairs),
    groups: groupBy ? groupRepairs(repairs, groupBy) : [],
  };
};

const toIssueListItem = (issue: QueriedIssue, today: string) => {
  const createdOn = toZonedIsoDate(issue.createdAt, ISSUE_QUERY_TIME_ZONE);
  const isOpen = issue.status !== "RESOLVED";
  return {
    id: issue.id,
    unitId: issue.unitId,
    unitName: issue.unit.name,
    applianceId: issue.applianceId,
    appliance: issue.appliance,
    description: issue.description,
    status: issue.status,
    isOpen,
    emergencyType: issue.emergencyType,
    createdOn,
    daysOpen: isOpen ? countDaysBetween(createdOn, today) : null,
    scheduledFor: issue.scheduledFor && toIsoDate(issue.scheduledFor),
    scheduledTime: issue.scheduledTime,
    resolvedOn:
      issue.resolvedAt &&
      toZonedIsoDate(issue.resolvedAt, ISSUE_QUERY_TIME_ZONE),
    resolution: issue.resolution,
    resolvedByHandymanId: issue.resolvedByHandymanId,
    resolvedByHandymanName: issue.resolvedByHandyman?.name ?? null,
    costRon: issue.costRon?.toNumber() ?? null,
  };
};

const matchesFilters = (issue: IssueListItem, filters: IssueListFilters) =>
  (!filters.unitId || issue.unitId === filters.unitId) &&
  (!filters.applianceId || issue.applianceId === filters.applianceId) &&
  (!filters.resolvedByHandymanId ||
    issue.resolvedByHandymanId === filters.resolvedByHandymanId) &&
  (!filters.statuses || filters.statuses.includes(issue.status)) &&
  (filters.isOpen === undefined || issue.isOpen === filters.isOpen) &&
  isWithin(issue.createdOn, filters.createdFrom, filters.createdTo) &&
  (!(filters.resolvedFrom || filters.resolvedTo) ||
    (issue.resolvedOn !== null &&
      isWithin(issue.resolvedOn, filters.resolvedFrom, filters.resolvedTo))) &&
  (filters.openLongerThanDays === undefined ||
    (issue.daysOpen !== null && issue.daysOpen > filters.openLongerThanDays));

const isWithin = (
  date: string,
  from: string | undefined,
  to: string | undefined,
) => (!from || date >= from) && (!to || date <= to);

// Summed in bani so decimal RON amounts add up exactly.
const sumCosts = (repairs: ReadonlyArray<IssueListItem>) => ({
  repairCount: repairs.length,
  repairsWithoutCost: repairs.filter((repair) => repair.costRon === null)
    .length,
  totalCostRon:
    repairs.reduce(
      (total, repair) => total + Math.round((repair.costRon ?? 0) * 100),
      0,
    ) / 100,
});

const groupRepairs = (
  repairs: ReadonlyArray<IssueListItem>,
  groupBy: RepairCostGrouping,
) => {
  const groups = new Map<
    string | null,
    { group: RepairCostGroup; repairs: IssueListItem[] }
  >();
  for (const repair of repairs) {
    const group = toRepairCostGroup(repair, groupBy);
    const entry = groups.get(group.id) ?? { group, repairs: [] };
    entry.repairs.push(repair);
    groups.set(group.id, entry);
  }
  const totals = [...groups.values()].map(({ group, repairs: grouped }) => ({
    ...group,
    ...sumCosts(grouped),
  }));
  return groupBy === "MONTH"
    ? totals.sort((first, second) =>
        (first.id ?? "").localeCompare(second.id ?? ""),
      )
    : totals.sort((first, second) => second.totalCostRon - first.totalCostRon);
};

const toRepairCostGroup = (
  repair: IssueListItem,
  groupBy: RepairCostGrouping,
): RepairCostGroup => {
  switch (groupBy) {
    case "UNIT":
      return { id: repair.unitId, label: repair.unitName };
    case "APPLIANCE":
      return {
        id: repair.applianceId,
        label:
          repair.appliance &&
          `${formatAppliance(repair.appliance)} (${repair.unitName})`,
      };
    case "HANDYMAN":
      return {
        id: repair.resolvedByHandymanId,
        label: repair.resolvedByHandymanName,
      };
    case "MONTH": {
      const month = repair.resolvedOn?.slice(0, 7) ?? null;
      return { id: month, label: month };
    }
  }
};

const formatAppliance = (appliance: NonNullable<IssueListItem["appliance"]>) =>
  [appliance.category, appliance.brand, appliance.model]
    .filter(Boolean)
    .join(" ");
