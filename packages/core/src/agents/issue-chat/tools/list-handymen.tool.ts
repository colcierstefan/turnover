import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import handymanService from "@turnover/core/handyman/services/handyman.service";

export const listHandymenTool = createTool({
  id: "list-handymen",
  description:
    "List the manager's saved handymen with their id, name and trades. Use it to find a handyman's id from the name in the question.",
  requestContextSchema: issueChatRequestContextSchema,
  inputSchema: z.object({}),
  execute: async (_input, { requestContext }) => {
    const handymen = await handymanService.listHandymen(
      requestContext.get("userId"),
      null,
    );
    return {
      handymen: handymen.map(({ id, name, trades }) => ({ id, name, trades })),
    };
  },
});
