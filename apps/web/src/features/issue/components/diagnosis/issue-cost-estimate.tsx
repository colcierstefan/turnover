import type { CostRange } from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueCostEstimate({
  partCostRon,
  labourCostRon,
  newApplianceCostRon,
  language,
}: Readonly<{
  partCostRon: CostRange | null;
  labourCostRon: CostRange | null;
  newApplianceCostRon: CostRange | null;
  language: UserLanguage;
}>) {
  const { locale, issue: text } = MANAGER_TEXT[language];
  const ronFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const rows = [
    { label: text.partCost, range: partCostRon },
    { label: text.labourCost, range: labourCostRon },
    { label: text.newApplianceCost, range: newApplianceCostRon },
  ].flatMap(({ label, range }) => (range ? [{ label, range }] : []));

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded border border-amber-500 bg-amber-500/10 p-3">
      <h3 className="font-medium">{text.estimateTitle}</h3>
      <p className="text-sm opacity-70">{text.estimateIntro}</p>
      <dl className="flex flex-col gap-1 text-sm">
        {rows.map(({ label, range }) => (
          <div key={label} className="flex justify-between gap-4">
            <dt>{label}</dt>
            <dd className="text-right font-medium">
              {text.costRange(
                ronFormat.format(range.minRon),
                ronFormat.format(range.maxRon),
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
