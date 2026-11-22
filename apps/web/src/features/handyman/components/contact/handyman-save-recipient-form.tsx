"use client";

import { useActionState, useState } from "react";

import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { saveRecipientAsHandyman } from "@/features/handyman/actions/handyman.actions";
import HandymanFields from "@/features/handyman/components/handyman/handyman-fields";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanSaveRecipientForm({
  handymanMessageId,
  name,
  phone,
  trade,
  language,
}: Readonly<{
  handymanMessageId: string;
  name: string | null;
  phone: string;
  trade: HandymanTrade | null;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].handymanContact;
  const [state, formAction, isPending] = useActionState(
    saveRecipientAsHandyman,
    null,
  );
  const [isDismissed, setIsDismissed] = useState(false);

  if (state && "isSaved" in state) {
    return <p className="text-sm">{text.savedAsHandyman}</p>;
  }
  if (isDismissed) return null;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-foreground/10 p-4"
    >
      <h3 className="font-medium">{text.saveAsHandymanTitle}</h3>
      <input type="hidden" name="handymanMessageId" value={handymanMessageId} />
      <HandymanFields
        handyman={{
          name: name ?? "",
          phone,
          trades: trade ? [trade] : [],
          notes: null,
        }}
        language={language}
      />
      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {text.saveAsHandyman}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsDismissed(true)}
      >
        {text.notNow}
      </Button>
    </form>
  );
}
