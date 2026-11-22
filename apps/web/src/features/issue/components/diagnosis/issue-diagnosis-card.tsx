import type { ApplianceCategory } from "@turnover/core/appliance/constants/appliance.constants";
import type {
  IssueCategory,
  WarrantyStatus,
} from "@turnover/core/issue/constants/issue.constants";
import type { StoredIssueDiagnosis } from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Card from "@/components/card";
import IssueApplianceSelect from "@/features/issue/components/diagnosis/issue-appliance-select";
import IssueCostEstimate from "@/features/issue/components/diagnosis/issue-cost-estimate";
import IssueDiagnoseButton from "@/features/issue/components/diagnosis/issue-diagnose-button";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueDiagnosisCard({
  issue,
  appliances,
  language,
}: Readonly<{
  issue: Readonly<{
    id: string;
    category: IssueCategory | null;
    diagnosis: StoredIssueDiagnosis | null;
    appliance: Readonly<{
      id: string;
      warrantyUntil: Date | null;
      warrantyStatus: WarrantyStatus;
    }> | null;
  }>;
  appliances: ReadonlyArray<{
    id: string;
    category: ApplianceCategory;
    brand: string | null;
    model: string | null;
  }>;
  language: UserLanguage;
}>) {
  const { locale, issue: text } = MANAGER_TEXT[language];
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const { diagnosis, appliance } = issue;

  return (
    <Card title={text.diagnosisTitle}>
      <IssueApplianceSelect
        issueId={issue.id}
        applianceId={appliance?.id ?? null}
        appliances={appliances}
        language={language}
      />
      {appliance && (
        <p className="text-sm">
          {text.warranty[appliance.warrantyStatus](
            appliance.warrantyUntil
              ? dateFormat.format(appliance.warrantyUntil)
              : "",
          )}
        </p>
      )}
      {diagnosis && issue.category ? (
        <>
          <span className="self-start rounded border border-foreground/20 px-2 py-0.5 text-xs">
            {text.categories[issue.category]}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">{text.likelyCauseTitle}</h3>
            <p className="text-sm">{diagnosis.likelyCause}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">{text.nextStepsTitle}</h3>
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
              {diagnosis.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          {diagnosis.trade && (
            <p className="text-sm">
              <span className="font-medium">{text.tradeLabel}:</span>{" "}
              {text.trades[diagnosis.trade]}
            </p>
          )}
          <IssueCostEstimate
            partCostRon={diagnosis.partCostRon}
            labourCostRon={diagnosis.labourCostRon}
            newApplianceCostRon={diagnosis.newApplianceCostRon}
            language={language}
          />
        </>
      ) : (
        <p className="text-sm opacity-70">{text.notDiagnosed}</p>
      )}
      <IssueDiagnoseButton
        issueId={issue.id}
        isDiagnosed={diagnosis !== null}
        language={language}
      />
    </Card>
  );
}
