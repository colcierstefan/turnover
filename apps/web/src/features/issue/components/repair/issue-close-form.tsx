"use client";

import { useActionState, useState } from "react";

import {
  MANAGER_ISSUE_RESOLUTIONS,
  type IssueResolution,
} from "@turnover/core/issue/constants/issue.constants";
import type { CostRange } from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { closeIssue } from "@/features/issue/actions/issue.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueCloseForm({
  issueId,
  applianceName,
  repairEstimateRon,
  newApplianceEstimateRon,
  handymen,
  lastMessagedHandymanId,
  language,
}: Readonly<{
  issueId: string;
  applianceName: string | null;
  repairEstimateRon: CostRange | null;
  newApplianceEstimateRon: CostRange | null;
  handymen: ReadonlyArray<{ id: string; name: string }>;
  lastMessagedHandymanId: string | null;
  language: UserLanguage;
}>) {
  const { locale, repair: text, issue: issueText } = MANAGER_TEXT[language];
  const [error, formAction, isPending] = useActionState(closeIssue, null);
  const [resolution, setResolution] = useState<IssueResolution>("REPAIRED");
  const ronFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const estimates = [
    { label: text.repairEstimateLabel, range: repairEstimateRon },
    { label: text.newApplianceEstimateLabel, range: newApplianceEstimateRon },
  ].flatMap(({ label, range }) =>
    range
      ? [
          `${label}: ${issueText.costRange(ronFormat.format(range.minRon), ronFormat.format(range.maxRon))}`,
        ]
      : [],
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="issueId" value={issueId} />
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 font-medium">{text.resolutionLabel}</legend>
        {MANAGER_ISSUE_RESOLUTIONS.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              type="radio"
              name="resolution"
              value={option}
              checked={resolution === option}
              onChange={() => setResolution(option)}
            />
            {text.resolutions[option]}
          </label>
        ))}
      </fieldset>
      {resolution === "REPLACED" && applianceName && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="retireAppliance"
            defaultChecked
            className="mt-1"
          />
          {text.retireAppliance(applianceName)}
        </label>
      )}
      <div className="flex flex-col gap-1">
        <Input
          label={text.costLabel}
          name="costRon"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
        />
        {estimates.map((estimate) => (
          <p key={estimate} className="text-sm opacity-70">
            {estimate}
          </p>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.costNoteLabel}</span>
        <textarea
          name="costNote"
          maxLength={1000}
          rows={2}
          className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.handymanLabel}</span>
        <select
          name="resolvedByHandymanId"
          defaultValue={lastMessagedHandymanId ?? ""}
          className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        >
          <option value="">{text.noHandyman}</option>
          {handymen.map((handyman) => (
            <option key={handyman.id} value={handyman.id}>
              {handyman.name}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {text.closeIssue}
      </Button>
    </form>
  );
}
