import { Suspense } from "react";

import unitService from "@turnover/core/unit/services/unit.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import UnitCreateForm from "@/features/unit/components/unit/unit-create-form";
import UnitList from "@/features/unit/components/unit/unit-list";

export default function UnitsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<p>Loading…</p>}>
          <Units />
        </Suspense>
      </main>
    </>
  );
}

async function Units() {
  const { user, membership } = await getSignedInMembership("/units");
  const units = await unitService.listUnits(user.id);

  return (
    <>
      <h1 className="text-2xl font-semibold">{membership.organization.name}</h1>
      <UnitList units={units} />
      <Card title="Add a unit">
        <UnitCreateForm />
      </Card>
    </>
  );
}
