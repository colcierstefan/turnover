"use client";

import { useActionState, useState } from "react";

import Button from "@/components/button";
import { uploadDocument } from "@/features/appliance/actions/document.actions";
import { MAX_UPLOAD_BYTES } from "@/features/appliance/constants/appliance.constants";

export default function DocumentUploadForm({
  unitId,
  kind,
  accept,
  submitLabel,
  pendingLabel,
}: Readonly<{
  unitId: string;
  kind: "LABEL_PHOTO" | "INVOICE";
  accept: string;
  submitLabel: string;
  pendingLabel: string;
}>) {
  const [error, formAction, isPending] = useActionState(uploadDocument, null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="unitId" value={unitId} />
      <input type="hidden" name="kind" value={kind} />
      <input
        type="file"
        name="file"
        accept={accept}
        required
        className="text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setSizeError(
            file && file.size > MAX_UPLOAD_BYTES
              ? "The file is over 10 MB"
              : null,
          );
        }}
      />
      {(sizeError ?? error) && (
        <p className="text-sm text-red-600">{sizeError ?? error}</p>
      )}
      <Button type="submit" disabled={isPending || sizeError !== null}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
