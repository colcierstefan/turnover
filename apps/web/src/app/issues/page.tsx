import { Suspense } from "react";
import Link from "next/link";

import { ISSUE_SUMMARY_MIN_OPEN_ISSUES } from "@turnover/core/issue/constants/issue.constants";
import issueService from "@turnover/core/issue/services/issue.service";

import AppHeader from "@/components/app-header";
import IssueOpenList from "@/features/issue/components/issue/issue-open-list";
import IssueRepairList from "@/features/issue/components/repair/issue-repair-list";
import IssueSummaryCard from "@/features/issue/components/summary/issue-summary-card";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssuesPage({ searchParams }: PageProps<"/issues">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Issues searchParams={searchParams} />
    </Suspense>
  );
}

async function Issues({
  searchParams,
}: Readonly<{ searchParams: PageProps<"/issues">["searchParams"] }>) {
  const { tab } = await searchParams;
  const isClosedTab = tab === "closed";
  const { user } = await getSignedInMembership(
    isClosedTab ? "/issues?tab=closed" : "/issues",
  );
  const text = MANAGER_TEXT[user.language].issues;
  const tabClass = (isActive: boolean) =>
    `flex-1 rounded px-4 py-2 text-center font-medium ${isActive ? "bg-foreground text-background" : "border border-foreground/20"}`;

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <nav className="flex gap-2">
          <Link href="/issues" className={tabClass(!isClosedTab)}>
            {text.openTab}
          </Link>
          <Link href="/issues?tab=closed" className={tabClass(isClosedTab)}>
            {text.closedTab}
          </Link>
        </nav>
        {isClosedTab ? (
          <IssueRepairList
            repairs={await issueService.listClosedIssuesForUser(user.id)}
            showUnit
            language={user.language}
          />
        ) : (
          <IssueOpenTab user={user} />
        )}
      </main>
    </>
  );
}

async function IssueOpenTab({
  user,
}: Readonly<{ user: Parameters<typeof issueService.getIssueSummary>[0] }>) {
  const issues = await issueService.listOpenIssuesForUser(user.id);
  const text = MANAGER_TEXT[user.language].issues;
  return (
    <>
      {issues.length >= ISSUE_SUMMARY_MIN_OPEN_ISSUES && (
        <Suspense
          fallback={<p className="text-sm opacity-70">{text.summaryLoading}</p>}
        >
          <IssueSummaryCard
            summary={issueService.getIssueSummary(user)}
            language={user.language}
          />
        </Suspense>
      )}
      <IssueOpenList issues={issues} language={user.language} />
    </>
  );
}
