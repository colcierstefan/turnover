import { describe, expect, it } from "vitest";

import {
  filterIssues,
  sumRepairCosts,
} from "@turnover/core/issue/utils/issue-query.utils";
import { Prisma } from "@turnover/db/client";

type QueriedIssue = Parameters<typeof filterIssues>[0][number];

const today = "2026-11-15";

const buildIssue = (overrides: Partial<QueriedIssue> = {}): QueriedIssue => ({
  id: "issue-1",
  unitId: "unit-1",
  applianceId: "washer-1",
  description: "The washing machine does not start",
  status: "DIAGNOSED",
  emergencyType: null,
  scheduledFor: null,
  scheduledTime: null,
  resolution: null,
  resolvedByHandymanId: null,
  costRon: null,
  resolvedAt: null,
  createdAt: new Date("2026-11-05T10:00:00Z"),
  unit: { name: "Old Town Studio" },
  appliance: { category: "WASHING_MACHINE", brand: "Bosch", model: "WAN28" },
  resolvedByHandyman: null,
  ...overrides,
});

const buildRepair = (overrides: Partial<QueriedIssue> = {}) =>
  buildIssue({
    status: "RESOLVED",
    resolution: "REPAIRED",
    resolvedAt: new Date("2026-11-10T10:00:00Z"),
    costRon: new Prisma.Decimal(100),
    ...overrides,
  });

const ids = (issues: ReadonlyArray<{ id: string }>) =>
  issues.map((issue) => issue.id);

describe("filterIssues", () => {
  it("counts days open in Bucharest time and leaves them empty for resolved issues", () => {
    const [open, resolved] = filterIssues(
      [
        buildIssue({ createdAt: new Date("2026-11-07T22:30:00Z") }),
        buildRepair({ id: "issue-2" }),
      ],
      {},
      today,
    );
    expect(open.createdOn).toBe("2026-11-08");
    expect(open.daysOpen).toBe(7);
    expect(resolved.daysOpen).toBeNull();
    expect(resolved.resolvedOn).toBe("2026-11-10");
  });

  it("keeps only issues open longer than the given days", () => {
    const issues = [
      buildIssue({ id: "eight", createdAt: new Date("2026-11-07T10:00:00Z") }),
      buildIssue({ id: "seven", createdAt: new Date("2026-11-08T10:00:00Z") }),
      buildRepair({ id: "old-repair", createdAt: new Date("2026-10-01") }),
    ];
    expect(ids(filterIssues(issues, { openLongerThanDays: 7 }, today))).toEqual(
      ["eight"],
    );
  });

  it("includes both ends of a resolved date range and skips unresolved issues", () => {
    const issues = [
      buildRepair({
        id: "first",
        resolvedAt: new Date("2026-10-31T22:30:00Z"),
      }),
      buildRepair({ id: "last", resolvedAt: new Date("2026-11-30T21:00:00Z") }),
      buildRepair({
        id: "after",
        resolvedAt: new Date("2026-11-30T22:30:00Z"),
      }),
      buildIssue({ id: "open" }),
    ];
    expect(
      ids(
        filterIssues(
          issues,
          { resolvedFrom: "2026-11-01", resolvedTo: "2026-11-30" },
          today,
        ),
      ),
    ).toEqual(["first", "last"]);
  });

  it("filters by unit, appliance, handyman, status and openness together", () => {
    const issues = [
      buildRepair({ id: "match", resolvedByHandymanId: "dorin" }),
      buildRepair({
        id: "other-unit",
        unitId: "unit-2",
        resolvedByHandymanId: "dorin",
      }),
      buildRepair({ id: "other-handyman", resolvedByHandymanId: "ion" }),
      buildIssue({ id: "open" }),
    ];
    expect(
      ids(
        filterIssues(
          issues,
          {
            unitId: "unit-1",
            applianceId: "washer-1",
            resolvedByHandymanId: "dorin",
            statuses: ["RESOLVED"],
            isOpen: false,
          },
          today,
        ),
      ),
    ).toEqual(["match"]);
  });
});

describe("sumRepairCosts", () => {
  const repairs = filterIssues(
    [
      buildRepair({
        id: "a",
        costRon: new Prisma.Decimal("120.10"),
        resolvedByHandymanId: "dorin",
        resolvedByHandyman: { name: "Dorin" },
      }),
      buildRepair({
        id: "b",
        unitId: "unit-2",
        unit: { name: "River Loft" },
        costRon: new Prisma.Decimal("0.20"),
        resolvedAt: new Date("2026-10-03T10:00:00Z"),
        resolvedByHandymanId: "dorin",
        resolvedByHandyman: { name: "Dorin" },
      }),
      buildRepair({
        id: "c",
        costRon: null,
        applianceId: null,
        appliance: null,
      }),
      buildIssue({ id: "open" }),
    ],
    {},
    today,
  );

  it("adds decimal costs exactly and counts repairs without a cost", () => {
    expect(sumRepairCosts(repairs, undefined)).toEqual({
      repairCount: 3,
      repairsWithoutCost: 1,
      totalCostRon: 120.3,
      groups: [],
    });
  });

  it("groups by handyman with repairs nobody was named for in their own group", () => {
    expect(sumRepairCosts(repairs, "HANDYMAN").groups).toEqual([
      {
        id: "dorin",
        label: "Dorin",
        repairCount: 2,
        repairsWithoutCost: 0,
        totalCostRon: 120.3,
      },
      {
        id: null,
        label: null,
        repairCount: 1,
        repairsWithoutCost: 1,
        totalCostRon: 0,
      },
    ]);
  });

  it("groups by month in calendar order", () => {
    expect(
      sumRepairCosts(repairs, "MONTH").groups.map((group) => [
        group.id,
        group.totalCostRon,
      ]),
    ).toEqual([
      ["2026-10", 0.2],
      ["2026-11", 120.1],
    ]);
  });

  it("labels appliance groups with their unit", () => {
    expect(sumRepairCosts(repairs, "APPLIANCE").groups[0].label).toBe(
      "WASHING_MACHINE Bosch WAN28 (Old Town Studio)",
    );
  });
});
