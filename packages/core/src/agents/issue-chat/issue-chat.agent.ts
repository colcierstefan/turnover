import "server-only";

import { Agent } from "@mastra/core/agent";

import { buildIssueChatInstructions } from "@turnover/core/agents/issue-chat/issue-chat.instructions";
import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { getIssueTool } from "@turnover/core/agents/issue-chat/tools/get-issue.tool";
import { getRepairCostsTool } from "@turnover/core/agents/issue-chat/tools/get-repair-costs.tool";
import { listAppliancesTool } from "@turnover/core/agents/issue-chat/tools/list-appliances.tool";
import { listHandymenTool } from "@turnover/core/agents/issue-chat/tools/list-handymen.tool";
import { listIssuesTool } from "@turnover/core/agents/issue-chat/tools/list-issues.tool";
import { listUnitsTool } from "@turnover/core/agents/issue-chat/tools/list-units.tool";
import env from "@turnover/core/config/env.config";
import vertex from "@turnover/core/lib/vertex";

export const ISSUE_CHAT_AGENT_ID = "issue-chat";
const MAX_STEPS = 6;

export const issueChatAgent = new Agent({
  id: ISSUE_CHAT_AGENT_ID,
  name: ISSUE_CHAT_AGENT_ID,
  instructions: ({ requestContext }) =>
    buildIssueChatInstructions(
      issueChatRequestContextSchema.parse(requestContext.toJSON()),
    ),
  model: vertex(env.vertex.modelId),
  tools: {
    listUnits: listUnitsTool,
    listAppliances: listAppliancesTool,
    listHandymen: listHandymenTool,
    listIssues: listIssuesTool,
    getIssue: getIssueTool,
    getRepairCosts: getRepairCostsTool,
  },
  requestContextSchema: issueChatRequestContextSchema,
  defaultOptions: {
    maxSteps: MAX_STEPS,
    providerOptions: {
      vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
    },
  },
});
