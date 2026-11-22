"use client";

import { useActionState, useState } from "react";

import type { DocumentReviewRowDraft } from "@turnover/core/appliance/utils/document-review.utils";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { saveDocumentReview } from "@/features/appliance/actions/document.actions";
import ApplianceFields from "@/features/appliance/components/appliance/appliance-fields";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function DocumentReviewForm({
  documentId,
  rows,
  canSkipRows,
  language,
}: Readonly<{
  documentId: string;
  rows: ReadonlyArray<DocumentReviewRowDraft>;
  canSkipRows: boolean;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const [error, formAction, isPending] = useActionState(
    saveDocumentReview,
    null,
  );
  const [acceptedRows, setAcceptedRows] = useState(() => rows.map(() => true));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="documentId" value={documentId} />
      {rows.map((row, index) => (
        <section
          key={index}
          className="flex flex-col gap-4 rounded-lg border border-foreground/10 p-4"
        >
          {row.description && <p className="font-medium">{row.description}</p>}
          {canSkipRows && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={acceptedRows[index]}
                onChange={(event) =>
                  setAcceptedRows((current) =>
                    current.map((isAccepted, rowIndex) =>
                      rowIndex === index ? event.target.checked : isAccepted,
                    ),
                  )
                }
              />
              {text.documentReview.addThisAppliance}
            </label>
          )}
          <fieldset
            disabled={!acceptedRows[index]}
            className="flex flex-col gap-4 disabled:opacity-40"
          >
            {row.quantity > 1 ? (
              <Input
                label={text.documentReview.howManyToAdd(row.quantity)}
                name={`rows.${index}.count`}
                type="number"
                min="1"
                max="20"
                defaultValue={row.quantity}
              />
            ) : (
              <input type="hidden" name={`rows.${index}.count`} value="1" />
            )}
            <ApplianceFields
              namePrefix={`rows.${index}.`}
              values={row.values}
              highlightedFields={row.extractedFields}
              language={language}
            />
          </fieldset>
        </section>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {text.save}
      </Button>
    </form>
  );
}
