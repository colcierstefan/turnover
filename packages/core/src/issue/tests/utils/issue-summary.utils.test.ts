import { describe, expect, it } from "vitest";

import { ISSUE_SUMMARY_DESCRIPTION_MAX_LENGTH } from "@turnover/core/issue/constants/issue.constants";
import {
  buildIssueSummaryFacts,
  getIssueSummaryFactsFingerprint,
} from "@turnover/core/issue/utils/issue-summary.utils";
import { Prisma } from "@turnover/db/client";

type OpenIssue = Parameters<typeof buildIssueSummaryFacts>[0][number];
type ClosedIssue = Parameters<typeof buildIssueSummaryFacts>[1][number];

const now = new Date("2026-11-22T21:30:00Z");

const washer = {
  category: "WASHING_MACHINE" as const,
  brand: "Bosch",
  model: "WAN28262BY",
};

const buildOpenIssue = (overrides: Partial<OpenIssue> = {}): OpenIssue => ({
  id: "open-1",
  unitId: "unit-1",
  applianceId: "washer-1",
  description: "The washing machine does not start",
  status: "DIAGNOSED",
  category: "REPAIR",
  diagnosis: {
    likelyCause: "The drain pump is blocked.",
    nextSteps: ["Call an appliance technician."],
    trade: "APPLIANCE_TECHNICIAN",
    partCostRon: { minRon: 150, maxRon: 250 },
    labourCostRon: { minRon: 200, maxRon: 300 },
    newApplianceCostRon: { minRon: 1800, maxRon: 2400 },
  },
  emergencyType: null,
  scheduledFor: null,
  scheduledTime: null,
  createdAt: new Date("2026-11-20T10:00:00Z"),
  unit: { name: "Old Town Studio" },
  appliance: washer,
  handymanMessages: [],
  ...overrides,
});

const buildClosedIssue = (
  overrides: Partial<ClosedIssue> = {},
): ClosedIssue => ({
  id: "closed-1",
  unitId: "unit-1",
  applianceId: "washer-1",
  costRon: new Prisma.Decimal(300),
  unit: { name: "Old Town Studio" },
  appliance: { ...washer, purchasePriceRon: new Prisma.Decimal(2100) },
  ...overrides,
});

const getOpenIssueFacts = (issue: OpenIssue) =>
  buildIssueSummaryFacts([issue], [], now).openIssues[0];

describe("buildIssueSummaryFacts", () => {
  it("counts days open in Bucharest calendar days", () => {
    expect(
      getOpenIssueFacts(
        buildOpenIssue({ createdAt: new Date("2026-11-21T22:30:00Z") }),
      ).daysOpen,
    ).toBe(0);
    expect(
      getOpenIssueFacts(
        buildOpenIssue({ createdAt: new Date("2026-11-21T21:30:00Z") }),
      ).daysOpen,
    ).toBe(1);
  });

  it("gives a passed visit day as negative days for a scheduled issue", () => {
    expect(
      getOpenIssueFacts(
        buildOpenIssue({
          status: "SCHEDULED",
          scheduledFor: new Date("2026-11-20"),
          scheduledTime: "10:00",
        }),
      ).visit,
    ).toEqual({ inDays: -2, time: "10:00" });
  });

  it("leaves out the visit of an issue that is no longer scheduled", () => {
    expect(
      getOpenIssueFacts(
        buildOpenIssue({
          status: "CONTACTED",
          scheduledFor: new Date("2026-11-24"),
        }),
      ).visit,
    ).toBeNull();
  });

  it("counts the days since the latest handyman message", () => {
    expect(
      getOpenIssueFacts(
        buildOpenIssue({
          handymanMessages: [
            { openedInWhatsAppAt: new Date("2026-11-19T09:00:00Z") },
          ],
        }),
      ).handymanMessagedDaysAgo,
    ).toBe(3);
    expect(getOpenIssueFacts(buildOpenIssue()).handymanMessagedDaysAgo).toBe(
      null,
    );
  });

  it("adds the part and labour estimates into one repair estimate", () => {
    const facts = getOpenIssueFacts(buildOpenIssue());

    expect(facts.repairEstimateRon).toEqual({ minRon: 350, maxRon: 550 });
    expect(facts.newApplianceEstimateRon).toEqual({
      minRon: 1800,
      maxRon: 2400,
    });
    expect(facts.trade).toBe("APPLIANCE_TECHNICIAN");
    expect(facts.appliance).toBe("WASHING_MACHINE Bosch WAN28262BY");
  });

  it("has no estimates or trade for an undiagnosed issue", () => {
    const facts = getOpenIssueFacts(buildOpenIssue({ diagnosis: null }));

    expect(facts.repairEstimateRon).toBeNull();
    expect(facts.newApplianceEstimateRon).toBeNull();
    expect(facts.trade).toBeNull();
  });

  it("shortens long descriptions", () => {
    expect(
      getOpenIssueFacts(buildOpenIssue({ description: "a".repeat(400) }))
        .description,
    ).toHaveLength(ISSUE_SUMMARY_DESCRIPTION_MAX_LENGTH);
  });

  it("reports an appliance with several closed issues with its cost, price and open issues", () => {
    const facts = buildIssueSummaryFacts(
      [buildOpenIssue(), buildOpenIssue({ id: "open-2", applianceId: null })],
      [
        buildClosedIssue(),
        buildClosedIssue({
          id: "closed-2",
          costRon: new Prisma.Decimal(450.5),
        }),
        buildClosedIssue({ id: "closed-3", costRon: null }),
        buildClosedIssue({ id: "closed-4", applianceId: "fridge-1" }),
      ],
      now,
    );

    expect(facts.repeatProblems).toEqual([
      {
        appliance: "WASHING_MACHINE Bosch WAN28262BY",
        unitName: "Old Town Studio",
        closedIssueCount: 3,
        repairCostRon: 750.5,
        purchasePriceRon: 2100,
        closedIssueIds: ["closed-1", "closed-2", "closed-3"],
        openIssueIds: ["open-1"],
      },
    ]);
  });
});

describe("getIssueSummaryFactsFingerprint", () => {
  it("is the same for the same facts and changes when an issue ages a day", () => {
    const issues = [buildOpenIssue()];
    const fingerprint = getIssueSummaryFactsFingerprint(
      buildIssueSummaryFacts(issues, [], now),
    );

    expect(
      getIssueSummaryFactsFingerprint(
        buildIssueSummaryFacts(issues, [], new Date("2026-11-22T05:00:00Z")),
      ),
    ).toBe(fingerprint);
    expect(
      getIssueSummaryFactsFingerprint(
        buildIssueSummaryFacts(issues, [], new Date("2026-11-23T05:00:00Z")),
      ),
    ).not.toBe(fingerprint);
  });
});
