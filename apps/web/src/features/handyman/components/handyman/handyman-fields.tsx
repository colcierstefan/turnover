import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Input from "@/components/input";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanFields({
  handyman,
  language,
}: Readonly<{
  handyman?: Readonly<{
    name: string;
    phone: string;
    trades: ReadonlyArray<HandymanTrade>;
    notes: string | null;
  }>;
  language: UserLanguage;
}>) {
  const { handymen: text, issue: issueText } = MANAGER_TEXT[language];

  return (
    <>
      <Input
        label={text.nameLabel}
        name="name"
        defaultValue={handyman?.name}
        required
        maxLength={100}
      />
      <Input
        label={text.phoneLabel}
        name="phone"
        type="tel"
        defaultValue={handyman?.phone}
        placeholder={text.phonePlaceholder}
        required
      />
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 font-medium">{text.tradesLabel}</legend>
        {Object.entries(issueText.trades).map(([trade, label]) => (
          <label key={trade} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="trades"
              value={trade}
              defaultChecked={handyman?.trades.includes(trade as HandymanTrade)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{text.notesLabel}</span>
        <textarea
          name="notes"
          maxLength={1000}
          rows={2}
          defaultValue={handyman?.notes ?? ""}
          className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        />
      </label>
    </>
  );
}
