import { issueChatMessagesSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-messages.schema";
import issueChatService from "@turnover/core/agents/issue-chat/services/issue-chat.service";
import { ForbiddenError } from "@turnover/core/lib/errors";
import userService from "@turnover/core/user/services/user.service";

export async function POST(request: Request) {
  const user = await userService.getCurrentUser();
  if (!user?.language) return new Response(null, { status: 401 });

  const body: unknown = await request.json();
  const messages = issueChatMessagesSchema.safeParse(
    typeof body === "object" && body !== null && "messages" in body
      ? body.messages
      : null,
  );
  if (!messages.success) return new Response(null, { status: 400 });

  try {
    return await issueChatService.streamReply(
      { id: user.id, language: user.language },
      messages.data,
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return new Response(null, { status: 403 });
    }
    throw error;
  }
}
