import { Suspense } from "react";

import handymanService from "@turnover/core/handyman/services/handyman.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import HandymanCreateForm from "@/features/handyman/components/handyman/handyman-create-form";
import HandymanList from "@/features/handyman/components/handyman/handyman-list";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymenPage() {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Handymen />
    </Suspense>
  );
}

async function Handymen() {
  const { user } = await getSignedInMembership("/handymen");
  const handymen = await handymanService.listHandymen(user.id, null);
  const text = MANAGER_TEXT[user.language].handymen;

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <p className="text-sm opacity-70">{text.intro}</p>
        </div>
        <HandymanList handymen={handymen} language={user.language} />
        <Card title={text.addTitle}>
          <HandymanCreateForm language={user.language} />
        </Card>
      </main>
    </>
  );
}
