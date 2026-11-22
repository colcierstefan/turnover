import { Suspense } from "react";
import Link from "next/link";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import issueService from "@turnover/core/issue/services/issue.service";

import AppHeader from "@/components/app-header";
import IssueDiagnosisCard from "@/features/issue/components/diagnosis/issue-diagnosis-card";
import IssueReporterDetails from "@/features/issue/components/issue/issue-reporter-details";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssuePage({
  params,
}: PageProps<"/units/[unitId]/issues/[issueId]">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Issue params={params} />
    </Suspense>
  );
}

async function Issue({
  params,
}: Readonly<{
  params: PageProps<"/units/[unitId]/issues/[issueId]">["params"];
}>) {
  const { unitId, issueId } = await params;
  const { user } = await getSignedInMembership(
    `/units/${unitId}/issues/${issueId}`,
  );
  const issue = await issueService.getIssue(user.id, issueId);
  const appliances = await applianceService.listAppliances(
    user.id,
    issue.unitId,
  );
  const text = MANAGER_TEXT[user.language];

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link href={`/units/${issue.unitId}`} className="text-sm opacity-70">
          {text.backToUnit}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{text.issue.title}</h1>
          <p className="text-sm opacity-70">
            {issue.unit.name} · {text.issues.statuses[issue.status]}
          </p>
        </div>
        <IssueReporterDetails issue={issue} language={user.language} />
        <IssueDiagnosisCard
          issue={issue}
          appliances={appliances}
          language={user.language}
        />
      </main>
    </>
  );
}
