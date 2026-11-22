import { Suspense } from "react";
import Link from "next/link";

import {
  APPLIANCE_CATEGORY_LABELS,
  DOCUMENT_KIND_LABELS,
} from "@turnover/core/appliance/constants/appliance.constants";
import applianceService from "@turnover/core/appliance/services/appliance.service";
import { toApplianceFormValues } from "@turnover/core/appliance/utils/appliance.utils";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import ApplianceDeleteButton from "@/features/appliance/components/appliance/appliance-delete-button";
import ApplianceForm from "@/features/appliance/components/appliance/appliance-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";

export default function AppliancePage({
  params,
}: PageProps<"/units/[unitId]/appliances/[applianceId]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<p>Loading…</p>}>
          <Appliance params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Appliance({
  params,
}: Readonly<{
  params: PageProps<"/units/[unitId]/appliances/[applianceId]">["params"];
}>) {
  const { unitId, applianceId } = await params;
  const { user } = await getSignedInMembership(
    `/units/${unitId}/appliances/${applianceId}`,
  );
  const appliance = await applianceService.getAppliance(user.id, applianceId);

  return (
    <>
      <Link href={`/units/${appliance.unitId}`} className="text-sm opacity-70">
        ← Back to unit
      </Link>
      <h1 className="text-2xl font-semibold">
        {APPLIANCE_CATEGORY_LABELS[appliance.category]}
      </h1>
      <Card title="Details">
        <ApplianceForm
          target={{ applianceId: appliance.id }}
          values={toApplianceFormValues(appliance)}
        />
      </Card>
      {appliance.documents.length > 0 && (
        <Card title="Documents">
          <ul className="flex flex-col gap-2">
            {appliance.documents.map((document) => (
              <li key={document.id}>
                <a
                  href={`/units/${appliance.unitId}/documents/${document.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {DOCUMENT_KIND_LABELS[document.kind]}, uploaded{" "}
                  {document.createdAt.toLocaleDateString("en-GB")}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <ApplianceDeleteButton applianceId={appliance.id} />
    </>
  );
}
