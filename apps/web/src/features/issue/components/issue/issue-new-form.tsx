"use client";

import { useActionState } from "react";

import type { ApplianceCategory } from "@turnover/core/appliance/constants/appliance.constants";
import { REPORT_PHOTO_CONTENT_TYPES } from "@turnover/core/issue/constants/issue.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { reportIssue } from "@/features/issue/actions/issue.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function IssueNewForm({
  unitId,
  appliances,
  language,
}: Readonly<{
  unitId: string;
  appliances: ReadonlyArray<{
    id: string;
    category: ApplianceCategory;
    brand: string | null;
    model: string | null;
  }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const [error, formAction, isPending] = useActionState(reportIssue, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="unitId" value={unitId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.newIssue.descriptionLabel}</span>
        <textarea
          name="description"
          required
          maxLength={2000}
          rows={4}
          placeholder={text.newIssue.descriptionPlaceholder}
          className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.newIssue.applianceLabel}</span>
        <select
          name="applianceId"
          defaultValue=""
          className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        >
          <option value="">{text.newIssue.noAppliance}</option>
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
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.newIssue.photosLabel}</span>
        <input
          type="file"
          name="photos"
          multiple
          accept={REPORT_PHOTO_CONTENT_TYPES.join(",")}
          className="text-sm"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? text.newIssue.submitting : text.newIssue.submit}
      </Button>
    </form>
  );
}
