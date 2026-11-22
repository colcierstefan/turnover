"use client";

import { useActionState, useState } from "react";

import Button from "@/components/button";
import Input from "@/components/input";
import { saveDocumentReview } from "@/features/appliance/actions/document.actions";
import ApplianceFields from "@/features/appliance/components/appliance/appliance-fields";
import type { DocumentReviewRowDraft } from "@/features/appliance/utils/document-review.utils";

export default function DocumentReviewForm({
  documentId,
  rows,
  canSkipRows,
}: Readonly<{
  documentId: string;
  rows: ReadonlyArray<DocumentReviewRowDraft>;
  canSkipRows: boolean;
}>) {
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
              Add this appliance
            </label>
          )}
          <fieldset
            disabled={!acceptedRows[index]}
            className="flex flex-col gap-4 disabled:opacity-40"
          >
            {row.quantity > 1 ? (
              <Input
                label={`${row.quantity} on this invoice. How many to add?`}
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
            />
          </fieldset>
        </section>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        Save
      </Button>
    </form>
  );
}
