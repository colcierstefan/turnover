import { RequestContext } from "@mastra/core/request-context";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IssueChatRequestContext } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { getIssueTool } from "@turnover/core/agents/issue-chat/tools/get-issue.tool";
import handymanService from "@turnover/core/handyman/services/handyman.service";
import issueService from "@turnover/core/issue/services/issue.service";
import { ForbiddenError, NotFoundError } from "@turnover/core/lib/errors";

vi.mock("@turnover/core/issue/services/issue.service", () => ({
  default: { getIssue: vi.fn() },
}));
vi.mock("@turnover/core/handyman/services/handyman.service", () => ({
  default: { listMessages: vi.fn(), getHandyman: vi.fn() },
}));

const requestContext = new RequestContext<IssueChatRequestContext>([
  ["userId", "user-1"],
  ["language", "RO"],
  ["today", "2026-11-15"],
]);

const execute = (issueId: string) =>
  getIssueTool.execute?.({ issueId }, { requestContext });

describe("getIssueTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("answers not found for an issue of another organization", async () => {
    vi.mocked(issueService.getIssue).mockRejectedValue(
      new ForbiddenError("User user-1 is not a member of organization org-2"),
    );

    await expect(execute("issue-of-org-2")).resolves.toEqual({
      error: "Not found in your organization.",
    });
    expect(issueService.getIssue).toHaveBeenCalledWith(
      "user-1",
      "issue-of-org-2",
    );
    expect(handymanService.listMessages).not.toHaveBeenCalled();
  });

  it("answers not found for an issue that does not exist", async () => {
    vi.mocked(issueService.getIssue).mockRejectedValue(
      new NotFoundError("Issue missing not found"),
    );

    await expect(execute("missing")).resolves.toEqual({
      error: "Not found in your organization.",
    });
  });
});
