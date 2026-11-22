"use client";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import ConfirmButton from "@/components/confirm-button";
import { deleteAppliance } from "@/features/appliance/actions/appliance.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function ApplianceDeleteButton({
  applianceId,
  language,
}: Readonly<{ applianceId: string; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].appliance;

  return (
    <ConfirmButton
      variant="danger"
      className="w-full"
      confirmMessage={text.deleteConfirm}
      onConfirm={() => deleteAppliance({ applianceId })}
    >
      {text.deleteAppliance}
    </ConfirmButton>
  );
}
