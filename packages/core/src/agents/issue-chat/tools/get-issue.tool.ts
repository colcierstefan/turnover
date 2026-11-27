import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { readInOrganization } from "@turnover/core/agents/issue-chat/utils/issue-chat-tool.utils";
import handymanService from "@turnover/core/handyman/services/handyman.service";
import { ISSUE_QUERY_TIME_ZONE } from "@turnover/core/issue/constants/issue.constants";
import issueService from "@turnover/core/issue/services/issue.service";
import {
  countDaysBetween,
  toIsoDate,
  toZonedIsoDate,
} from "@turnover/core/utils/date.utils";

export const getIssueTool = createTool({
  id: "get-issue",
  description:
    "Everything about one issue: what was reported, the unit and appliance, the diagnosis (likely cause, next steps, trade, cost estimate ranges in RON), the handyman messages sent, the scheduled visit, and for a closed issue how it ended, who fixed it, the final cost in RON and the note.",
  requestContextSchema: issueChatRequestContextSchema,
  inputSchema: z.object({
    issueId: z.string().min(1).describe("The issue id, from list-issues."),
  }),
  execute: async ({ issueId }, { requestContext }) =>
    readInOrganization(async () => {
      const userId = requestContext.get("userId");
      const issue = await issueService.getIssue(userId, issueId);
      const [messages, resolvedByHandyman] = await Promise.all([
        handymanService.listMessages(userId, issueId),
        issue.resolvedByHandymanId
          ? handymanService.getHandyman(userId, issue.resolvedByHandymanId)
          : null,
      ]);
      const createdOn = toZonedIsoDate(issue.createdAt, ISSUE_QUERY_TIME_ZONE);
      const isOpen = issue.status !== "RESOLVED";
      return {
        id: issue.id,
        unitName: issue.unit.name,
        unitAddress: issue.unit.address,
        appliance: issue.appliance && {
          category: issue.appliance.category,
          brand: issue.appliance.brand,
          model: issue.appliance.model,
          warrantyStatus: issue.appliance.warrantyStatus,
        },
        reporterRole: issue.reporterRole,
        description: issue.description,
        emergencyType: issue.emergencyType,
        status: issue.status,
        createdOn,
        daysOpen: isOpen
          ? countDaysBetween(createdOn, requestContext.get("today"))
          : null,
        diagnosis: issue.diagnosis && {
          category: issue.category,
          ...issue.diagnosis,
        },
        handymanMessages: messages.map((message) => ({
          recipientName: message.recipientName,
          sentOn: toZonedIsoDate(
            message.openedInWhatsAppAt,
            ISSUE_QUERY_TIME_ZONE,
          ),
        })),
        scheduledFor: issue.scheduledFor && toIsoDate(issue.scheduledFor),
        scheduledTime: issue.scheduledTime,
        resolvedOn:
          issue.resolvedAt &&
          toZonedIsoDate(issue.resolvedAt, ISSUE_QUERY_TIME_ZONE),
        resolution: issue.resolution,
        resolvedByHandymanName: resolvedByHandyman?.name ?? null,
        costRon: issue.costRon,
        costNote: issue.costNote,
      };
    }),
});
