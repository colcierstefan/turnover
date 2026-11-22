"use client";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import ConfirmButton from "@/components/confirm-button";
import { deleteHandyman } from "@/features/handyman/actions/handyman.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanDeleteButton({
  handyman,
  language,
}: Readonly<{
  handyman: Readonly<{ id: string; name: string }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].handymen;

  return (
    <ConfirmButton
      variant="danger"
      className="w-full"
      confirmMessage={text.deleteConfirm(handyman.name)}
      onConfirm={() => deleteHandyman({ handymanId: handyman.id })}
    >
      {text.deleteHandyman}
    </ConfirmButton>
  );
}
