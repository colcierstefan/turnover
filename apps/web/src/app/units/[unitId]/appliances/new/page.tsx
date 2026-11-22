import { Suspense } from "react";
import Link from "next/link";

import unitService from "@turnover/core/unit/services/unit.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import ApplianceForm from "@/features/appliance/components/appliance/appliance-form";
import DocumentUploadForm from "@/features/appliance/components/document/document-upload-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";

export default function NewAppliancePage({
  params,
}: PageProps<"/units/[unitId]/appliances/new">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<p>Loading…</p>}>
          <NewAppliance params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function NewAppliance({
  params,
}: Readonly<{
  params: PageProps<"/units/[unitId]/appliances/new">["params"];
}>) {
  const { unitId } = await params;
  const { user } = await getSignedInMembership(
    `/units/${unitId}/appliances/new`,
  );
  const unit = await unitService.getUnit(user.id, unitId);

  return (
    <>
      <Link href={`/units/${unit.id}`} className="text-sm opacity-70">
        ← {unit.name}
      </Link>
      <h1 className="text-2xl font-semibold">Add appliance</h1>
      <Card title="Photo of the label">
        <p className="text-sm opacity-70">
          The rating plate, usually inside the door or on the back.
        </p>
        <DocumentUploadForm
          unitId={unit.id}
          kind="LABEL_PHOTO"
          accept="image/*"
          submitLabel="Read label"
          pendingLabel="Reading the label…"
        />
      </Card>
      <Card title="Invoice">
        <p className="text-sm opacity-70">
          Photo or PDF. Every appliance on it becomes a row to review.
        </p>
        <DocumentUploadForm
          unitId={unit.id}
          kind="INVOICE"
          accept="image/*,application/pdf"
          submitLabel="Read invoice"
          pendingLabel="Reading the invoice…"
        />
      </Card>
      <Card title="Enter by hand">
        <ApplianceForm
          target={{ unitId: unit.id }}
          values={{
            category: "",
            brand: "",
            model: "",
            serialNumber: "",
            manufactureDate: "",
            purchaseDate: "",
            purchasePriceRon: "",
            warrantyUntil: "",
            notes: "",
          }}
        />
      </Card>
    </>
  );
}
