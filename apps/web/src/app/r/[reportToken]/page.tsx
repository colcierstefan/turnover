import { Suspense } from "react";

import { ISSUE_REPORT_TEXT } from "@turnover/core/issue/constants/issue-report-text.constants";
import unitService from "@turnover/core/unit/services/unit.service";

import IssueReportFlow from "@/features/issue/components/report/issue-report-flow";
import { getReporterLanguage } from "@/features/issue/server/issue-report-language.server";

export default function ReportPage({ params }: PageProps<"/r/[reportToken]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <Suspense fallback={<p>…</p>}>
        <Report params={params} />
      </Suspense>
    </main>
  );
}

async function Report({
  params,
}: Readonly<{ params: PageProps<"/r/[reportToken]">["params"] }>) {
  const { reportToken } = await params;
  const [unit, language] = await Promise.all([
    unitService.getUnitByReportToken(reportToken),
    getReporterLanguage(),
  ]);
  if (!unit) {
    return <p className="text-lg">{ISSUE_REPORT_TEXT[language].invalidLink}</p>;
  }

  return (
    <IssueReportFlow
      reportToken={reportToken}
      unitName={unit.name}
      language={language}
      contactPhone={unit.organization.contactPhone}
    />
  );
}
