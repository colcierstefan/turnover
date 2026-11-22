"use client";

import { useActionState, useState } from "react";

import { ISSUE_REPORT_TEXT } from "@turnover/core/issue/constants/issue-report-text.constants";
import {
  MAX_REPORT_PHOTO_BYTES,
  MAX_REPORT_PHOTOS,
  REPORT_PHOTO_CONTENT_TYPES,
  type ReporterLanguage,
} from "@turnover/core/issue/constants/issue.constants";
import type { IssueReportStep } from "@turnover/core/issue/types/issue-report.types";

import Button from "@/components/button";
import Input from "@/components/input";
import { submitIssueReport } from "@/features/issue/actions/issue-report.actions";

export default function IssueReportForm({
  reportToken,
  language,
  onStep,
}: Readonly<{
  reportToken: string;
  language: ReporterLanguage;
  onStep: (step: IssueReportStep) => void;
}>) {
  const text = ISSUE_REPORT_TEXT[language];
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, formAction, isPending] = useActionState(
    async (_previousError: string | null, formData: FormData) => {
      try {
        const result = await submitIssueReport(formData);
        if ("error" in result) {
          return result.error === "TOO_MANY_REPORTS"
            ? text.tooManyReports
            : text.sendFailed;
        }
        onStep(result.step);
        return null;
      } catch {
        return text.sendFailed;
      }
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="reportToken" value={reportToken} />
      <input type="hidden" name="reporterLanguage" value={language} />
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 font-medium">{text.roleLabel}</legend>
        <div className="flex gap-2">
          {(["GUEST", "CLEANER"] as const).map((role) => (
            <label
              key={role}
              className="flex flex-1 items-center gap-2 rounded border border-foreground/20 px-3 py-2 has-checked:border-foreground"
            >
              <input
                type="radio"
                name="reporterRole"
                value={role}
                defaultChecked={role === "GUEST"}
              />
              {role === "GUEST" ? text.guest : text.cleaner}
            </label>
          ))}
        </div>
      </fieldset>
      <Input label={text.nameLabel} name="reporterName" maxLength={100} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.descriptionLabel}</span>
        <textarea
          name="description"
          required
          maxLength={2000}
          rows={4}
          placeholder={text.descriptionPlaceholder}
          className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.photosLabel}</span>
        <input
          type="file"
          name="photos"
          multiple
          accept={REPORT_PHOTO_CONTENT_TYPES.join(",")}
          className="text-sm"
          onChange={(event) =>
            setPhotoError(
              checkPhotos(Array.from(event.target.files ?? []), text),
            )
          }
        />
      </label>
      {(photoError ?? error) && (
        <p className="text-sm text-red-600">{photoError ?? error}</p>
      )}
      <Button type="submit" disabled={isPending || photoError !== null}>
        {isPending ? text.sending : text.submit}
      </Button>
    </form>
  );
}

const checkPhotos = (
  photos: ReadonlyArray<File>,
  text: (typeof ISSUE_REPORT_TEXT)[ReporterLanguage],
) => {
  if (photos.length > MAX_REPORT_PHOTOS) return text.tooManyPhotos;
  if (
    photos.some(
      (photo) =>
        !(REPORT_PHOTO_CONTENT_TYPES as ReadonlyArray<string>).includes(
          photo.type,
        ),
    )
  ) {
    return text.photoNotSupported;
  }
  if (photos.some((photo) => photo.size > MAX_REPORT_PHOTO_BYTES)) {
    return text.photoTooLarge;
  }
  return null;
};
