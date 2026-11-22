"use client";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import ConfirmButton from "@/components/confirm-button";
import { deleteUnit } from "@/features/unit/actions/unit.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitDeleteButton({
  unit,
  applianceCount,
  documentCount,
  issueCount,
  language,
}: Readonly<{
  unit: { id: string; name: string };
  applianceCount: number;
  documentCount: number;
  issueCount: number;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].unit;

  return (
    <ConfirmButton
      variant="danger"
      className="w-full"
      confirmMessage={text.deleteConfirm(unit.name, {
        applianceCount,
        documentCount,
        issueCount,
      })}
      onConfirm={() => deleteUnit({ unitId: unit.id })}
    >
      {text.deleteUnit}
    </ConfirmButton>
  );
}
