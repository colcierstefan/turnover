import { RequestContext } from "@mastra/core/request-context";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IssueChatRequestContext } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { listIssuesTool } from "@turnover/core/agents/issue-chat/tools/list-issues.tool";
import issueService from "@turnover/core/issue/services/issue.service";
import type { IssueListItem } from "@turnover/core/issue/utils/issue-query.utils";
import { ForbiddenError } from "@turnover/core/lib/errors";

vi.mock("@turnover/core/issue/services/issue.service", () => ({
  default: { listOrganizationIssues: vi.fn() },
}));

const requestContext = new RequestContext<IssueChatRequestContext>([
  ["userId", "user-1"],
  ["language", "EN"],
  ["today", "2026-11-15"],
]);

const buildItem = (index: number): IssueListItem => ({
  id: `issue-${index}`,
  unitId: "unit-1",
  unitName: "Old Town Studio",
  applianceId: null,
  appliance: null,
  description: "x".repeat(300),
  status: "NEW",
  isOpen: true,
  emergencyType: null,
  createdOn: "2026-11-01",
  daysOpen: 14,
  scheduledFor: null,
  scheduledTime: null,
  resolvedOn: null,
  resolution: null,
  resolvedByHandymanId: null,
  resolvedByHandymanName: null,
  costRon: null,
});

const execute = (
  input: Parameters<NonNullable<typeof listIssuesTool.execute>>[0],
) => listIssuesTool.execute?.(input, { requestContext });

describe("listIssuesTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads the signed-in manager and today from the request context", async () => {
    vi.mocked(issueService.listOrganizationIssues).mockResolvedValue([]);

    await execute({ isOpen: true });

    expect(issueService.listOrganizationIssues).toHaveBeenCalledWith(
      "user-1",
      { isOpen: true },
      "2026-11-15",
    );
  });

  it("returns the full count but lists at most 30 issues with short descriptions", async () => {
    vi.mocked(issueService.listOrganizationIssues).mockResolvedValue(
      Array.from({ length: 31 }, (_, index) => buildItem(index)),
    );

    const result = await execute({});

    expect(result).toMatchObject({
      count: 31,
      isTruncated: true,
      issues: expect.any(Array),
    });
    const { issues } = result as { issues: Array<{ description: string }> };
    expect(issues).toHaveLength(30);
    expect(issues[0].description).toHaveLength(150);
  });

  it("answers not found for a unit of another organization", async () => {
    vi.mocked(issueService.listOrganizationIssues).mockRejectedValue(
      new ForbiddenError("User user-1 is not a member of organization org-2"),
    );

    await expect(execute({ unitId: "unit-of-org-2" })).resolves.toEqual({
      error: "Not found in your organization.",
    });
  });

  it("lets unexpected errors through", async () => {
    vi.mocked(issueService.listOrganizationIssues).mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(execute({})).rejects.toThrow("Database unavailable");
  });
});
