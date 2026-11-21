import { Suspense } from "react";
import Link from "next/link";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import UnitDeleteButton from "@/features/unit/components/unit/unit-delete-button";
import UnitEditForm from "@/features/unit/components/unit/unit-edit-form";
import UnitReportLinkCard from "@/features/unit/components/unit/unit-report-link-card";
import {
  createReportQrSvg,
  getReportUrl,
} from "@/features/unit/server/unit-report-link.server";
import unitService from "@/features/unit/services/unit.service";

export default function UnitPage({ params }: PageProps<"/units/[unitId]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link href="/units" className="text-sm opacity-70">
          ← All units
        </Link>
        <Suspense fallback={<p>Loading…</p>}>
          <Unit params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Unit({
  params,
}: Readonly<{ params: PageProps<"/units/[unitId]">["params"] }>) {
  const { unitId } = await params;
  const { user } = await getSignedInMembership(`/units/${unitId}`);
  const unit = await unitService.getUnit(user.id, unitId);
  const reportUrl = getReportUrl(unit.reportToken);
  const qrSvg = await createReportQrSvg(reportUrl);

  return (
    <>
      <h1 className="text-2xl font-semibold">{unit.name}</h1>
      <UnitReportLinkCard unit={unit} reportUrl={reportUrl} qrSvg={qrSvg} />
      <Card title="Details">
        <UnitEditForm unit={unit} />
      </Card>
      <UnitDeleteButton unit={unit} />
    </>
  );
}
