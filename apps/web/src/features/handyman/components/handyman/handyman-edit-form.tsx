"use client";

import { useActionState } from "react";

import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { updateHandyman } from "@/features/handyman/actions/handyman.actions";
import HandymanFields from "@/features/handyman/components/handyman/handyman-fields";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanEditForm({
  handyman,
  language,
}: Readonly<{
  handyman: Readonly<{
    id: string;
    name: string;
    phone: string;
    trades: ReadonlyArray<HandymanTrade>;
    notes: string | null;
  }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const [state, formAction, isPending] = useActionState(updateHandyman, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="handymanId" value={handyman.id} />
      <HandymanFields handyman={handyman} language={language} />
      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state && "isSaved" in state && (
        <p className="text-sm">{text.handymen.saved}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {text.save}
      </Button>
    </form>
  );
}
