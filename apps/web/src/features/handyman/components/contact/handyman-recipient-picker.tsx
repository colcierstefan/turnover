"use client";

import { useState } from "react";

import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import {
  phoneNumberSchema,
  type HandymanMessageRecipient,
} from "@turnover/core/handyman/schemas/handyman.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanRecipientPicker({
  handymen,
  preferredTrade,
  isDrafting,
  language,
  onPick,
}: Readonly<{
  handymen: ReadonlyArray<{
    id: string;
    name: string;
    phone: string;
    trades: ReadonlyArray<HandymanTrade>;
  }>;
  preferredTrade: HandymanTrade | null;
  isDrafting: boolean;
  language: UserLanguage;
  onPick: (
    recipient: HandymanMessageRecipient,
    phone: string | null,
    recipientLabel: string | null,
  ) => void;
}>) {
  const {
    handymanContact: text,
    issue: issueText,
    formErrors,
  } = MANAGER_TEXT[language];
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);

  const pickTypedPhone = () => {
    const parsed = phoneNumberSchema.safeParse(phone);
    setIsPhoneInvalid(!parsed.success);
    if (!parsed.success) return;
    const recipientName = name.trim() || null;
    onPick(
      { kind: "PHONE", phone: parsed.data, name: recipientName },
      parsed.data,
      recipientName ?? parsed.data,
    );
  };

  return (
    <fieldset disabled={isDrafting} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">{text.yourHandymenTitle}</h3>
        {handymen.length === 0 ? (
          <p className="text-sm opacity-70">{text.noHandymen}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {handymen.map((handyman) => (
              <li key={handyman.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-1 rounded border border-foreground/20 px-3 py-2 text-left disabled:opacity-50"
                  onClick={() =>
                    onPick(
                      { kind: "HANDYMAN", handymanId: handyman.id },
                      handyman.phone,
                      handyman.name,
                    )
                  }
                >
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {handyman.name}
                    {preferredTrade &&
                      handyman.trades.includes(preferredTrade) && (
                        <span className="rounded border border-foreground/20 px-2 py-0.5 text-xs font-normal">
                          {text.matchesTrade}
                        </span>
                      )}
                  </span>
                  <span className="text-sm opacity-70">
                    {handyman.trades
                      .map((trade) => issueText.trades[trade])
                      .join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium">{text.someoneElseTitle}</h3>
        <Input
          label={text.phoneLabel}
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <Input
          label={text.nameLabel}
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
        />
        {isPhoneInvalid && (
          <p className="text-sm text-red-600">{formErrors.phone}</p>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={phone.trim() === ""}
          onClick={pickTypedPhone}
        >
          {text.writeMessage}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPick({ kind: "WHATSAPP_CHAT" }, null, null)}
        >
          {text.chooseChatInWhatsApp}
        </Button>
      </div>
    </fieldset>
  );
}
