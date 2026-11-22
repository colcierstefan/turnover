import { Suspense } from "react";
import Link from "next/link";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import documentService from "@turnover/core/appliance/services/document.service";
import unitService from "@turnover/core/unit/services/unit.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import ApplianceList from "@/features/appliance/components/appliance/appliance-list";
import DocumentUnreviewedList from "@/features/appliance/components/document/document-unreviewed-list";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import UnitDeleteButton from "@/features/unit/components/unit/unit-delete-button";
import UnitEditForm from "@/features/unit/components/unit/unit-edit-form";
import UnitReportLinkCard from "@/features/unit/components/unit/unit-report-link-card";
import {
  createReportQrSvg,
  getReportUrl,
} from "@/features/unit/server/unit-report-link.server";

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
  const [qrSvg, appliances, unreviewedDocuments, contents] = await Promise.all([
    createReportQrSvg(reportUrl),
    applianceService.listAppliances(user.id, unitId),
    documentService.listUnreviewedDocuments(user.id, unitId),
    applianceService.countUnitContents(user.id, unitId),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">{unit.name}</h1>
      <Card title="Appliances">
        <ApplianceList unitId={unit.id} appliances={appliances} />
        <Link
          href={`/units/${unit.id}/appliances/new`}
          className="rounded bg-foreground px-4 py-2 text-center font-medium text-background"
        >
          Add appliance
        </Link>
      </Card>
      {unreviewedDocuments.length > 0 && (
        <Card title="Waiting for review">
          <DocumentUnreviewedList
            unitId={unit.id}
            documents={unreviewedDocuments}
          />
        </Card>
      )}
      <UnitReportLinkCard unit={unit} reportUrl={reportUrl} qrSvg={qrSvg} />
      <Card title="Details">
        <UnitEditForm unit={unit} />
      </Card>
      <UnitDeleteButton
        unit={unit}
        applianceCount={contents.applianceCount}
        documentCount={contents.documentCount}
      />
    </>
  );
}
