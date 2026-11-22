"use client";

import { useTransition } from "react";

import type { ApplianceCategory } from "@turnover/core/appliance/constants/appliance.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { changeIssueAppliance } from "@/features/issue/actions/issue.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueApplianceSelect({
  issueId,
  applianceId,
  appliances,
  language,
}: Readonly<{
  issueId: string;
  applianceId: string | null;
  appliances: ReadonlyArray<{
    id: string;
    category: ApplianceCategory;
    brand: string | null;
    model: string | null;
  }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{text.issue.applianceLabel}</span>
      <select
        value={applianceId ?? ""}
        disabled={isPending}
        onChange={(event) => {
          const selected = event.target.value || null;
          startTransition(() =>
            changeIssueAppliance({ issueId, applianceId: selected }),
          );
        }}
        className="rounded border border-foreground/20 bg-background px-3 py-2 text-base disabled:opacity-50"
      >
        <option value="">{text.issue.noAppliance}</option>
        {appliances.map((appliance) => (
          <option key={appliance.id} value={appliance.id}>
            {[
              text.appliance.categories[appliance.category],
              appliance.brand,
              appliance.model,
            ]
              .filter(Boolean)
              .join(" ")}
          </option>
        ))}
      </select>
    </label>
  );
}
