"use client";

import { useState, useTransition } from "react";

import type { HandymanMessageRecipient } from "@turnover/core/handyman/schemas/handyman.schema";
import { buildWhatsAppUrl } from "@turnover/core/handyman/utils/handyman-whatsapp.utils";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import {
  recordHandymanMessage,
  translateHandymanMessage,
} from "@/features/handyman/actions/handyman.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

const TEXTAREA_CLASSES =
  "rounded border border-foreground/20 bg-background px-3 py-2 text-base";

export default function HandymanMessageEditor({
  issueId,
  draft,
  language,
  onSent,
  onChangeRecipient,
}: Readonly<{
  issueId: string;
  draft: Readonly<{
    recipient: HandymanMessageRecipient;
    phone: string | null;
    recipientLabel: string | null;
    textRo: string;
    textEn: string | null;
  }>;
  language: UserLanguage;
  onSent: (
    message: Readonly<{ id: string; handymanId: string | null }>,
  ) => void;
  onChangeRecipient: () => void;
}>) {
  const text = MANAGER_TEXT[language].handymanContact;
  const [textRo, setTextRo] = useState(draft.textRo);
  const [textEn, setTextEn] = useState(draft.textEn);
  const [isRomanianOutdated, setIsRomanianOutdated] = useState(false);
  const [isTranslating, startTranslating] = useTransition();
  const [isRecording, startRecording] = useTransition();
  const canSend = !isRomanianOutdated && textRo.trim() !== "";

  const updateRomanian = () =>
    startTranslating(async () => {
      if (textEn === null) return;
      const translation = await translateHandymanMessage({ textEn });
      setTextRo(translation.textRo);
      setIsRomanianOutdated(false);
    });

  const recordOpened = () =>
    startRecording(async () => {
      onSent(
        await recordHandymanMessage({
          issueId,
          recipient: draft.recipient,
          textRo,
          textEn,
        }),
      );
    });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-medium">
        {draft.recipientLabel
          ? text.messageTo(draft.recipientLabel)
          : text.messageToChosenChat}
      </h3>
      {textEn === null ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{text.messageRoLabel}</span>
          <textarea
            value={textRo}
            rows={8}
            maxLength={2000}
            onChange={(event) => setTextRo(event.target.value)}
            className={TEXTAREA_CLASSES}
          />
        </label>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{text.messageEnLabel}</span>
            <textarea
              value={textEn}
              rows={8}
              maxLength={2000}
              onChange={(event) => {
                setTextEn(event.target.value);
                setIsRomanianOutdated(true);
              }}
              className={TEXTAREA_CLASSES}
            />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{text.romanianPreviewLabel}</span>
            <p
              className={`rounded bg-foreground/5 px-3 py-2 whitespace-pre-wrap ${isRomanianOutdated ? "opacity-50" : ""}`}
            >
              {textRo}
            </p>
          </div>
          {isRomanianOutdated && (
            <p className="text-sm text-amber-700">{text.romanianOutdated}</p>
          )}
          <Button
            type="button"
            variant="secondary"
            disabled={!isRomanianOutdated || isTranslating || !textEn.trim()}
            onClick={updateRomanian}
          >
            {isTranslating ? text.updatingRomanian : text.updateRomanian}
          </Button>
        </>
      )}
      {canSend ? (
        <a
          href={buildWhatsAppUrl(draft.phone, textRo)}
          target="_blank"
          rel="noreferrer"
          onClick={recordOpened}
          aria-disabled={isRecording}
          className="rounded bg-green-600 px-4 py-2 text-center font-medium text-white"
        >
          {text.openInWhatsApp}
        </a>
      ) : (
        <Button type="button" disabled>
          {text.openInWhatsApp}
        </Button>
      )}
      <Button type="button" variant="secondary" onClick={onChangeRecipient}>
        {text.changeRecipient}
      </Button>
    </div>
  );
}
