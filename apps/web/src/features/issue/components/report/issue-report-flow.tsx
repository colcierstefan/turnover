"use client";

import { useState } from "react";

import { ISSUE_REPORT_TEXT } from "@turnover/core/issue/constants/issue-report-text.constants";
import type { ReporterLanguage } from "@turnover/core/issue/constants/issue.constants";
import type { IssueReportStep } from "@turnover/core/issue/types/issue-report.types";

import IssueReportEmergency from "@/features/issue/components/report/issue-report-emergency";
import IssueReportFollowUpForm from "@/features/issue/components/report/issue-report-follow-up-form";
import IssueReportForm from "@/features/issue/components/report/issue-report-form";
import IssueReportLanguageSwitch from "@/features/issue/components/report/issue-report-language-switch";
import IssueReportMessage from "@/features/issue/components/report/issue-report-message";
import IssueReportTips from "@/features/issue/components/report/issue-report-tips";

type FlowStep = IssueReportStep | { step: "FORM" } | { step: "FIXED" };

export default function IssueReportFlow({
  reportToken,
  unitName,
  language,
  contactPhone,
}: Readonly<{
  reportToken: string;
  unitName: string;
  language: ReporterLanguage;
  contactPhone: string | null;
}>) {
  const [current, setCurrent] = useState<FlowStep>({ step: "FORM" });
  const text = ISSUE_REPORT_TEXT[language];

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{text.title(unitName)}</h1>
        {current.step === "FORM" && (
          <IssueReportLanguageSwitch language={language} />
        )}
      </div>
      {renderStep()}
    </>
  );

  function renderStep() {
    switch (current.step) {
      case "FORM":
        return (
          <IssueReportForm
            reportToken={reportToken}
            language={language}
            onStep={setCurrent}
          />
        );
      case "EMERGENCY":
        return (
          <IssueReportEmergency
            language={language}
            emergencyType={current.emergencyType}
            contactPhone={contactPhone}
          />
        );
      case "FOLLOW_UPS":
        return (
          <IssueReportFollowUpForm
            reportToken={reportToken}
            language={language}
            issueId={current.issueId}
            followUps={current.followUps}
            onStep={setCurrent}
          />
        );
      case "TIPS":
        return (
          <IssueReportTips
            reportToken={reportToken}
            language={language}
            issueId={current.issueId}
            tips={current.tips}
            onFixed={() => setCurrent({ step: "FIXED" })}
            onStillBroken={() =>
              setCurrent({ step: "SENT", issueId: current.issueId })
            }
          />
        );
      case "SENT":
        return (
          <IssueReportMessage title={text.sentTitle} body={text.sentBody} />
        );
      case "FIXED":
        return (
          <IssueReportMessage title={text.fixedTitle} body={text.fixedBody} />
        );
    }
  }
}
