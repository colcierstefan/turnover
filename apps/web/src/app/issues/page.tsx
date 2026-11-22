import { Suspense } from "react";

import issueService from "@turnover/core/issue/services/issue.service";

import AppHeader from "@/components/app-header";
import IssueOpenList from "@/features/issue/components/issue/issue-open-list";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssuesPage() {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Issues />
    </Suspense>
  );
}

async function Issues() {
  const { user } = await getSignedInMembership("/issues");
  const issues = await issueService.listOpenIssuesForUser(user.id);

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold">
          {MANAGER_TEXT[user.language].issues.title}
        </h1>
        <IssueOpenList issues={issues} language={user.language} />
      </main>
    </>
  );
}
