import type {
  EmergencyType,
  ReporterRole,
} from "@turnover/core/issue/constants/issue.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Card from "@/components/card";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueReporterDetails({
  issue,
  language,
}: Readonly<{
  issue: Readonly<{
    id: string;
    unitId: string;
    description: string;
    reporterRole: ReporterRole;
    reporterName: string | null;
    emergencyType: EmergencyType | null;
    resolvedByReporter: boolean;
    createdAt: Date;
    photos: ReadonlyArray<{ id: string }>;
    followUps: ReadonlyArray<{
      id: string;
      question: string;
      answer: string | null;
    }>;
    selfHelpTips: ReadonlyArray<string> | null;
  }>;
  language: UserLanguage;
}>) {
  const { locale, issues: listText, issue: text } = MANAGER_TEXT[language];
  const createdAtFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Bucharest",
  });

  return (
    <Card>
      {issue.emergencyType && (
        <span className="self-start rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
          {listText.emergency(listText.emergencyTypes[issue.emergencyType])}
        </span>
      )}
      <p className="whitespace-pre-line">{issue.description}</p>
      <p className="text-sm opacity-70">
        {[listText.reporterRoles[issue.reporterRole], issue.reporterName]
          .filter(Boolean)
          .join(", ")}{" "}
        · {createdAtFormat.format(issue.createdAt)}
      </p>
      {issue.photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">{text.photosTitle}</h3>
          <div className="grid grid-cols-3 gap-2">
            {issue.photos.map((photo, index) => (
              <a
                key={photo.id}
                href={`/units/${issue.unitId}/issues/${issue.id}/photos/${photo.id}`}
                target="_blank"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- private file streamed by our own route */}
                <img
                  src={`/units/${issue.unitId}/issues/${issue.id}/photos/${photo.id}`}
                  alt={text.photoAlt(index + 1)}
                  className="aspect-square w-full rounded object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      {issue.followUps.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">{text.followUpsTitle}</h3>
          <dl className="flex flex-col gap-2 text-sm">
            {issue.followUps.map((followUp) => (
              <div key={followUp.id}>
                <dt className="opacity-70">{followUp.question}</dt>
                <dd>{followUp.answer || text.noAnswer}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {issue.selfHelpTips && issue.selfHelpTips.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">{text.tipsTitle}</h3>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
            {issue.selfHelpTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
          {issue.resolvedByReporter && (
            <p className="text-sm">{text.fixedByReporter}</p>
          )}
        </div>
      )}
    </Card>
  );
}
