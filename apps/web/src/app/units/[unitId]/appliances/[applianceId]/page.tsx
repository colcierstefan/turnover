import { Suspense } from "react";
import Link from "next/link";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import { toApplianceFormValues } from "@turnover/core/appliance/utils/appliance.utils";
import issueService from "@turnover/core/issue/services/issue.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import ApplianceDeleteButton from "@/features/appliance/components/appliance/appliance-delete-button";
import ApplianceForm from "@/features/appliance/components/appliance/appliance-form";
import IssueRepairList from "@/features/issue/components/repair/issue-repair-list";
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
  const [appliance, repairHistory] = await Promise.all([
    applianceService.getAppliance(user.id, applianceId),
    issueService.getApplianceRepairHistory(user.id, applianceId),
  ]);
  const text = MANAGER_TEXT[user.language];
  const dateFormat = new Intl.DateTimeFormat(text.locale);
  const ronFormat = new Intl.NumberFormat(text.locale, {
    minimumFractionDigits: 2,
    trailingZeroDisplay: "stripIfInteger",
  });

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
        {appliance.retiredAt && (
          <p className="text-sm">
            {text.appliance.retiredOn(dateFormat.format(appliance.retiredAt))}
          </p>
        )}
        <Card title={text.repair.historyTitle}>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt>{text.appliance.purchasePriceLabel}</dt>
              <dd className="font-medium">
                {appliance.purchasePriceRon === null
                  ? text.appliance.unknownPrice
                  : text.repair.amountRon(
                      ronFormat.format(appliance.purchasePriceRon),
                    )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{text.appliance.repairsTotalLabel}</dt>
              <dd className="font-medium">
                {text.repair.amountRon(
                  ronFormat.format(repairHistory.totalCostRonAllTime),
                )}
              </dd>
            </div>
          </dl>
          <IssueRepairList
            repairs={repairHistory.repairs}
            showUnit={false}
            language={user.language}
          />
        </Card>
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
