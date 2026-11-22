import { describe, expect, it } from "vitest";

import { getWarrantyStatus } from "@turnover/core/issue/utils/appliance-warranty.utils";

const today = new Date("2026-11-22T15:00:00Z");

describe("getWarrantyStatus", () => {
  it("is unknown without a warranty end date", () => {
    expect(getWarrantyStatus(null, today)).toBe("UNKNOWN");
  });

  it("is under warranty through the last day", () => {
    expect(getWarrantyStatus(new Date("2026-11-22"), today)).toBe(
      "UNDER_WARRANTY",
    );
  });

  it("has expired the day after the end date", () => {
    expect(getWarrantyStatus(new Date("2026-11-21"), today)).toBe("EXPIRED");
  });
});
