import { ISSUE_REPORT_TEXT } from "@turnover/core/issue/constants/issue-report-text.constants";
import {
  EMERGENCY_PHONE_NUMBER,
  type EmergencyType,
  type ReporterLanguage,
} from "@turnover/core/issue/constants/issue.constants";

export default function IssueReportEmergency({
  language,
  emergencyType,
  contactPhone,
}: Readonly<{
  language: ReporterLanguage;
  emergencyType: EmergencyType;
  contactPhone: string | null;
}>) {
  const text = ISSUE_REPORT_TEXT[language];
  const emergency = text.emergencies[emergencyType];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-red-600">{emergency.title}</h2>
      <p className="text-sm">{text.emergencyIntro}</p>
      <ol className="flex list-decimal flex-col gap-2 pl-5">
        {emergency.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {contactPhone && (
        <a
          href={`tel:${contactPhone.replace(/\s/g, "")}`}
          className="rounded bg-foreground px-4 py-3 text-center font-medium text-background"
        >
          {text.callHost}: {contactPhone}
        </a>
      )}
      <a
        href={`tel:${EMERGENCY_PHONE_NUMBER}`}
        className="rounded border border-red-600 px-4 py-3 text-center font-medium text-red-600"
      >
        {text.callEmergency}
      </a>
    </div>
  );
}
