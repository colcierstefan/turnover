"use client";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import ConfirmButton from "@/components/confirm-button";
import { regenerateReportToken } from "@/features/unit/actions/unit.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitRegenerateLinkButton({
  unitId,
  language,
}: Readonly<{ unitId: string; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].reportLink;

  return (
    <ConfirmButton
      variant="secondary"
      confirmMessage={text.newLinkConfirm}
      onConfirm={() => regenerateReportToken({ unitId })}
    >
      {text.newLink}
    </ConfirmButton>
  );
}
