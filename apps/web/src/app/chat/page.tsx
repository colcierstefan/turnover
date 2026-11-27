import { Suspense } from "react";

import AppHeader from "@/components/app-header";
import IssueChatPanel from "@/features/issue/components/chat/issue-chat-panel";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function ChatPage() {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Chat />
    </Suspense>
  );
}

async function Chat() {
  const { user } = await getSignedInMembership("/chat");
  const text = MANAGER_TEXT[user.language].chat;

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <p className="text-sm opacity-70">{text.intro}</p>
        </div>
        <IssueChatPanel language={user.language} />
      </main>
    </>
  );
}
