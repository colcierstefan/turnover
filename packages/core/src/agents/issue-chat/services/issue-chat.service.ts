import "server-only";

import { handleChatStream } from "@mastra/ai-sdk";
import { RequestContext } from "@mastra/core/request-context";
import { createUIMessageStreamResponse } from "ai";

import { ISSUE_CHAT_AGENT_ID } from "@turnover/core/agents/issue-chat/issue-chat.agent";
import type { IssueChatMessages } from "@turnover/core/agents/issue-chat/schemas/issue-chat-messages.schema";
import type { IssueChatRequestContext } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import mastra from "@turnover/core/agents/mastra";
import { ISSUE_QUERY_TIME_ZONE } from "@turnover/core/issue/constants/issue.constants";
import logger from "@turnover/core/lib/logger";
import organizationService from "@turnover/core/organization/services/organization.service";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";
import { toZonedIsoDate } from "@turnover/core/utils/date.utils";

type Manager = Readonly<{ id: string; language: UserLanguage }>;

const MAX_HISTORY_MESSAGES = 20;

class IssueChatService {
  async streamReply(manager: Manager, messages: IssueChatMessages) {
    await organizationService.requireMembership(manager.id);
    const stream = await handleChatStream({
      mastra,
      agentId: ISSUE_CHAT_AGENT_ID,
      version: "v7",
      params: {
        messages: messages.slice(-MAX_HISTORY_MESSAGES),
        requestContext: new RequestContext<IssueChatRequestContext>([
          ["userId", manager.id],
          ["language", manager.language],
          ["today", toZonedIsoDate(new Date(), ISSUE_QUERY_TIME_ZONE)],
        ]),
      },
      onError: (error) => {
        logger.error({ err: error, userId: manager.id }, "Issue chat failed");
        return "";
      },
    });
    return createUIMessageStreamResponse({ stream });
  }
}

const issueChatService = new IssueChatService();
export default issueChatService;
