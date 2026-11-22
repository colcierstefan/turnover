"use client";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import ConfirmButton from "@/components/confirm-button";
import { discardDocument } from "@/features/appliance/actions/document.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function DocumentDiscardButton({
  documentId,
  language,
}: Readonly<{ documentId: string; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].documentReview;

  return (
    <ConfirmButton
      variant="danger"
      confirmMessage={text.discardConfirm}
      onConfirm={() => discardDocument({ documentId })}
    >
      {text.discard}
    </ConfirmButton>
  );
}
