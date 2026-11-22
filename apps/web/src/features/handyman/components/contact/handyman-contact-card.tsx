"use client";

import { useState, useTransition } from "react";

import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import type { HandymanMessageRecipient } from "@turnover/core/handyman/schemas/handyman.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Card from "@/components/card";
import { draftHandymanMessage } from "@/features/handyman/actions/handyman.actions";
import HandymanMessageEditor from "@/features/handyman/components/contact/handyman-message-editor";
import HandymanRecipientPicker from "@/features/handyman/components/contact/handyman-recipient-picker";
import HandymanSaveRecipientForm from "@/features/handyman/components/contact/handyman-save-recipient-form";
import HandymanSharePhotosButton from "@/features/handyman/components/contact/handyman-share-photos-button";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

type Draft = Readonly<{
  recipient: HandymanMessageRecipient;
  phone: string | null;
  recipientLabel: string | null;
  textRo: string;
  textEn: string | null;
}>;

type SentMessage = Readonly<{
  id: string;
  recipient: HandymanMessageRecipient;
  isSavedHandyman: boolean;
}>;

export default function HandymanContactCard({
  issueId,
  handymen,
  preferredTrade,
  isUnderWarranty,
  photoUrls,
  language,
}: Readonly<{
  issueId: string;
  handymen: ReadonlyArray<{
    id: string;
    name: string;
    phone: string;
    trades: ReadonlyArray<HandymanTrade>;
  }>;
  preferredTrade: HandymanTrade | null;
  isUnderWarranty: boolean;
  photoUrls: ReadonlyArray<string>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].handymanContact;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [sentMessage, setSentMessage] = useState<SentMessage | null>(null);
  const [isDrafting, startDrafting] = useTransition();
  const [hasDraftFailed, setHasDraftFailed] = useState(false);

  const writeDraft = (
    recipient: HandymanMessageRecipient,
    phone: string | null,
    recipientLabel: string | null,
  ) =>
    startDrafting(async () => {
      setHasDraftFailed(false);
      try {
        const { textRo, textEn } = await draftHandymanMessage({
          issueId,
          recipient,
        });
        setDraft({ recipient, phone, recipientLabel, textRo, textEn });
      } catch {
        setHasDraftFailed(true);
      }
    });

  const startOver = () => {
    setDraft(null);
    setSentMessage(null);
  };

  return (
    <Card title={text.title}>
      {isUnderWarranty && (
        <p className="rounded border border-amber-500 bg-amber-500/10 p-3 text-sm">
          {text.warrantyHint}
        </p>
      )}
      {sentMessage ? (
        <>
          {sentMessage.recipient.kind === "PHONE" &&
            !sentMessage.isSavedHandyman && (
              <HandymanSaveRecipientForm
                handymanMessageId={sentMessage.id}
                name={sentMessage.recipient.name}
                phone={sentMessage.recipient.phone}
                trade={preferredTrade}
                language={language}
              />
            )}
          <Button type="button" variant="secondary" onClick={startOver}>
            {text.changeRecipient}
          </Button>
        </>
      ) : draft ? (
        <HandymanMessageEditor
          issueId={issueId}
          draft={draft}
          language={language}
          onSent={(message) =>
            setSentMessage({
              id: message.id,
              recipient: draft.recipient,
              isSavedHandyman: message.handymanId !== null,
            })
          }
          onChangeRecipient={startOver}
        />
      ) : (
        <HandymanRecipientPicker
          handymen={handymen}
          preferredTrade={preferredTrade}
          isDrafting={isDrafting}
          language={language}
          onPick={writeDraft}
        />
      )}
      {isDrafting && <p className="text-sm opacity-70">{text.drafting}</p>}
      {hasDraftFailed && (
        <p className="text-sm text-red-600">{text.draftFailed}</p>
      )}
      <HandymanSharePhotosButton photoUrls={photoUrls} language={language} />
    </Card>
  );
}
