import { Suspense } from "react";
import Link from "next/link";

import handymanService from "@turnover/core/handyman/services/handyman.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import HandymanDeleteButton from "@/features/handyman/components/handyman/handyman-delete-button";
import HandymanEditForm from "@/features/handyman/components/handyman/handyman-edit-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanPage({
  params,
}: PageProps<"/handymen/[handymanId]">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Handyman params={params} />
    </Suspense>
  );
}

async function Handyman({
  params,
}: Readonly<{ params: PageProps<"/handymen/[handymanId]">["params"] }>) {
  const { handymanId } = await params;
  const { user } = await getSignedInMembership(`/handymen/${handymanId}`);
  const handyman = await handymanService.getHandyman(user.id, handymanId);
  const text = MANAGER_TEXT[user.language].handymen;

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link href="/handymen" className="text-sm opacity-70">
          {text.allHandymen}
        </Link>
        <h1 className="text-2xl font-semibold">{handyman.name}</h1>
        <Card title={text.detailsTitle}>
          <HandymanEditForm handyman={handyman} language={user.language} />
        </Card>
        <HandymanDeleteButton handyman={handyman} language={user.language} />
      </main>
    </>
  );
}
