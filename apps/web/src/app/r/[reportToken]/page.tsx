import { Suspense } from "react";

import unitService from "@turnover/core/unit/services/unit.service";

export default function ReportPage({ params }: PageProps<"/r/[reportToken]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <Suspense fallback={<p>Loading…</p>}>
        <Report params={params} />
      </Suspense>
    </main>
  );
}

async function Report({
  params,
}: Readonly<{ params: PageProps<"/r/[reportToken]">["params"] }>) {
  const { reportToken } = await params;
  const unit = await unitService.getUnitByReportToken(reportToken);

  if (!unit) {
    return <p className="text-lg">This link is no longer valid.</p>;
  }

  return (
    <h1 className="text-2xl font-semibold">Report a problem in {unit.name}</h1>
  );
}
