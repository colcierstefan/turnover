import { Suspense } from "react";
import Link from "next/link";

import unitService from "@turnover/core/unit/services/unit.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import ApplianceForm from "@/features/appliance/components/appliance/appliance-form";
import DocumentUploadForm from "@/features/appliance/components/document/document-upload-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function NewAppliancePage({
  params,
}: PageProps<"/units/[unitId]/appliances/new">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <NewAppliance params={params} />
    </Suspense>
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
  const text = MANAGER_TEXT[user.language].newAppliance;

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link href={`/units/${unit.id}`} className="text-sm opacity-70">
          ← {unit.name}
        </Link>
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <Card title={text.labelPhotoTitle}>
          <p className="text-sm opacity-70">{text.labelPhotoIntro}</p>
          <DocumentUploadForm
            unitId={unit.id}
            kind="LABEL_PHOTO"
            accept="image/*"
            submitLabel={text.readLabel}
            pendingLabel={text.readingLabel}
            language={user.language}
          />
        </Card>
        <Card title={text.invoiceTitle}>
          <p className="text-sm opacity-70">{text.invoiceIntro}</p>
          <DocumentUploadForm
            unitId={unit.id}
            kind="INVOICE"
            accept="image/*,application/pdf"
            submitLabel={text.readInvoice}
            pendingLabel={text.readingInvoice}
            language={user.language}
          />
        </Card>
        <Card title={text.manualTitle}>
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
            language={user.language}
          />
        </Card>
      </main>
    </>
  );
}
