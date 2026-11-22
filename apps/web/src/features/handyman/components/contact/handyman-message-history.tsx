import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Card from "@/components/card";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanMessageHistory({
  messages,
  language,
}: Readonly<{
  messages: ReadonlyArray<{
    id: string;
    recipientName: string | null;
    recipientPhone: string | null;
    textRo: string;
    textEn: string | null;
    openedInWhatsAppAt: Date;
  }>;
  language: UserLanguage;
}>) {
  const { locale, handymanContact: text } = MANAGER_TEXT[language];
  const openedAtFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Bucharest",
  });

  if (messages.length === 0) return null;

  return (
    <Card title={text.historyTitle}>
      <ul className="flex flex-col divide-y divide-foreground/10">
        {messages.map((message) => (
          <li key={message.id} className="flex flex-col gap-2 py-3">
            <span className="font-medium">
              {[message.recipientName, message.recipientPhone]
                .filter(Boolean)
                .join(", ") || text.chosenInWhatsApp}
            </span>
            <span className="text-sm opacity-70">
              {text.openedOn(openedAtFormat.format(message.openedInWhatsAppAt))}
            </span>
            <p className="text-sm whitespace-pre-wrap">{message.textRo}</p>
            {message.textEn && (
              <p className="text-sm whitespace-pre-wrap opacity-70">
                {message.textEn}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
