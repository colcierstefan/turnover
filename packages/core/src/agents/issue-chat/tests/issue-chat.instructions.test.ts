import { describe, expect, it } from "vitest";

import { buildIssueChatInstructions } from "@turnover/core/agents/issue-chat/issue-chat.instructions";

describe("buildIssueChatInstructions", () => {
  it("gives the date ranges of this and last month and year", () => {
    const instructions = buildIssueChatInstructions({
      language: "EN",
      today: "2026-03-15",
    });

    expect(instructions).toContain("This month is 2026-03-01 to 2026-03-15");
    expect(instructions).toContain("last month is 2026-02-01 to 2026-02-28");
    expect(instructions).toContain("this year is 2026-01-01 to 2026-03-15");
    expect(instructions).toContain("last year is 2025-01-01 to 2025-12-31");
  });

  it("takes last month from the previous year in January", () => {
    expect(
      buildIssueChatInstructions({ language: "EN", today: "2027-01-10" }),
    ).toContain("last month is 2026-12-01 to 2026-12-31");
  });

  it("answers in Romanian with the Romanian names of the app's pages", () => {
    const instructions = buildIssueChatInstructions({
      language: "RO",
      today: "2026-11-15",
    });

    expect(instructions).toContain("Always reply in Romanian");
    expect(instructions).toContain("„Meșteri”");
  });
});
