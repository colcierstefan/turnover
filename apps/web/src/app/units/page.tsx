import { Suspense } from "react";

import unitService from "@turnover/core/unit/services/unit.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import UnitCreateForm from "@/features/unit/components/unit/unit-create-form";
import UnitList from "@/features/unit/components/unit/unit-list";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitsPage() {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Units />
    </Suspense>
  );
}

async function Units() {
  const { user, membership } = await getSignedInMembership("/units");
  const units = await unitService.listUnits(user.id);

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold">
          {membership.organization.name}
        </h1>
        <UnitList units={units} language={user.language} />
        <Card title={MANAGER_TEXT[user.language].units.addUnitTitle}>
          <UnitCreateForm language={user.language} />
        </Card>
      </main>
    </>
  );
}
