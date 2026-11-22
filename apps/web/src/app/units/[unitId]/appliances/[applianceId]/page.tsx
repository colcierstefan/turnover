import { Suspense } from "react";
import Link from "next/link";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import { toApplianceFormValues } from "@turnover/core/appliance/utils/appliance.utils";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import ApplianceDeleteButton from "@/features/appliance/components/appliance/appliance-delete-button";
import ApplianceForm from "@/features/appliance/components/appliance/appliance-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function AppliancePage({
  params,
}: PageProps<"/units/[unitId]/appliances/[applianceId]">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Appliance params={params} />
    </Suspense>
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
  const text = MANAGER_TEXT[user.language];
  const dateFormat = new Intl.DateTimeFormat(text.locale);

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link
          href={`/units/${appliance.unitId}`}
          className="text-sm opacity-70"
        >
          {text.backToUnit}
        </Link>
        <h1 className="text-2xl font-semibold">
          {text.appliance.categories[appliance.category]}
        </h1>
        <Card title={text.appliance.detailsTitle}>
          <ApplianceForm
            target={{ applianceId: appliance.id }}
            values={toApplianceFormValues(appliance)}
            language={user.language}
          />
        </Card>
        {appliance.documents.length > 0 && (
          <Card title={text.appliance.documentsTitle}>
            <ul className="flex flex-col gap-2">
              {appliance.documents.map((document) => (
                <li key={document.id}>
                  <a
                    href={`/units/${appliance.unitId}/documents/${document.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {text.appliance.uploaded(
                      text.appliance.documentKinds[document.kind],
                      dateFormat.format(document.createdAt),
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <ApplianceDeleteButton
          applianceId={appliance.id}
          language={user.language}
        />
      </main>
    </>
  );
}
