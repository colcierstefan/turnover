import { createTool } from "@mastra/core/tools";

import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { listIssuesInputSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-tools.schema";
import { readInOrganization } from "@turnover/core/agents/issue-chat/utils/issue-chat-tool.utils";
import issueService from "@turnover/core/issue/services/issue.service";

const MAX_LISTED_ISSUES = 30;
const MAX_DESCRIPTION_LENGTH = 150;

export const listIssuesTool = createTool({
  id: "list-issues",
  description: `List the manager's issues that match every filter given, newest first. Returns count (all matches) and at most ${MAX_LISTED_ISSUES} issues; isTruncated is true when more matched than are listed. Each issue has its unit, appliance, status, the day it was reported (createdOn), daysOpen (open issues only), a scheduled visit, the day it was closed (resolvedOn), how it ended, who fixed it and the final cost in RON. For money totals use get-repair-costs instead.`,
  requestContextSchema: issueChatRequestContextSchema,
  inputSchema: listIssuesInputSchema,
  execute: async (filters, { requestContext }) =>
    readInOrganization(async () => {
      const issues = await issueService.listOrganizationIssues(
        requestContext.get("userId"),
        filters,
        requestContext.get("today"),
      );
      return {
        count: issues.length,
        isTruncated: issues.length > MAX_LISTED_ISSUES,
        issues: issues.slice(0, MAX_LISTED_ISSUES).map((issue) => ({
          id: issue.id,
          unitName: issue.unitName,
          appliance: issue.appliance,
          description: issue.description.slice(0, MAX_DESCRIPTION_LENGTH),
          status: issue.status,
          emergencyType: issue.emergencyType,
          createdOn: issue.createdOn,
          daysOpen: issue.daysOpen,
          scheduledFor: issue.scheduledFor,
          scheduledTime: issue.scheduledTime,
          resolvedOn: issue.resolvedOn,
          resolution: issue.resolution,
          resolvedByHandymanName: issue.resolvedByHandymanName,
          costRon: issue.costRon,
        })),
      };
    }),
});
