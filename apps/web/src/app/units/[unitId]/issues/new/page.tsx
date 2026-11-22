import { Suspense } from "react";
import Link from "next/link";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import unitService from "@turnover/core/unit/services/unit.service";

import AppHeader from "@/components/app-header";
import IssueNewForm from "@/features/issue/components/issue/issue-new-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function NewIssuePage({
  params,
}: PageProps<"/units/[unitId]/issues/new">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <NewIssue params={params} />
    </Suspense>
  );
}

async function NewIssue({
  params,
}: Readonly<{ params: PageProps<"/units/[unitId]/issues/new">["params"] }>) {
  const { unitId } = await params;
  const { user } = await getSignedInMembership(`/units/${unitId}/issues/new`);
  const [unit, appliances] = await Promise.all([
    unitService.getUnit(user.id, unitId),
    applianceService.listAppliances(user.id, unitId),
  ]);
  const text = MANAGER_TEXT[user.language];

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link href={`/units/${unit.id}`} className="text-sm opacity-70">
          {text.backToUnit}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{text.newIssue.title}</h1>
          <p className="text-sm opacity-70">
            {unit.name} · {text.newIssue.intro}
          </p>
        </div>
        <IssueNewForm
          unitId={unit.id}
          appliances={appliances}
          language={user.language}
        />
      </main>
    </>
  );
}
