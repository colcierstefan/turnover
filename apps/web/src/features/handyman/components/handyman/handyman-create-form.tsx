"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { createHandyman } from "@/features/handyman/actions/handyman.actions";
import HandymanFields from "@/features/handyman/components/handyman/handyman-fields";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanCreateForm({
  language,
}: Readonly<{ language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].handymen;
  const [error, formAction, isPending] = useActionState(createHandyman, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <HandymanFields language={language} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {text.addHandyman}
      </Button>
    </form>
  );
}
