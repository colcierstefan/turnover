import { Suspense } from "react";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import UserLanguageForm from "@/features/user/components/language/user-language-form";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const { user } = await getSignedInMembership("/settings");
  const text = MANAGER_TEXT[user.language];

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold">{text.settings.title}</h1>
        <Card title={text.settings.language}>
          <UserLanguageForm language={user.language} />
        </Card>
      </main>
    </>
  );
}
