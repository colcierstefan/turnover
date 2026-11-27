import { createTool } from "@mastra/core/tools";

import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { getRepairCostsInputSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-tools.schema";
import { readInOrganization } from "@turnover/core/agents/issue-chat/utils/issue-chat-tool.utils";
import issueService from "@turnover/core/issue/services/issue.service";

export const getRepairCostsTool = createTool({
  id: "get-repair-costs",
  description:
    "Total repair costs in RON of closed issues that match every filter given. A repair counts on the day its issue was closed. Returns repairCount (closed issues), totalCostRon, repairsWithoutCost (closed with no cost entered) and, with groupBy, the same three numbers per group. A group with a null id and label holds repairs with no appliance, or no handyman named.",
  requestContextSchema: issueChatRequestContextSchema,
  inputSchema: getRepairCostsInputSchema,
  execute: async (filters, { requestContext }) =>
    readInOrganization(() =>
      issueService.getRepairCosts(
        requestContext.get("userId"),
        filters,
        requestContext.get("today"),
      ),
    ),
});
