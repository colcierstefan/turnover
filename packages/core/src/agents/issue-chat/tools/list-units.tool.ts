import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import unitService from "@turnover/core/unit/services/unit.service";

export const listUnitsTool = createTool({
  id: "list-units",
  description:
    "List the manager's units (rental apartments) with their id, name and address. Use it to find a unit's id from the name in the question.",
  requestContextSchema: issueChatRequestContextSchema,
  inputSchema: z.object({}),
  execute: async (_input, { requestContext }) => {
    const units = await unitService.listUnits(requestContext.get("userId"));
    return {
      units: units.map(({ id, name, address }) => ({ id, name, address })),
    };
  },
});
