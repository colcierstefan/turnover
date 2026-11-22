"use client";

import ConfirmButton from "@/components/confirm-button";
import { discardDocument } from "@/features/appliance/actions/document.actions";

export default function DocumentDiscardButton({
  documentId,
}: Readonly<{ documentId: string }>) {
  return (
    <ConfirmButton
      variant="danger"
      confirmMessage="Discard this upload? The file is deleted."
      onConfirm={() => discardDocument({ documentId })}
    >
      Discard
    </ConfirmButton>
  );
}
