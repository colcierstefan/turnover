import Link from "next/link";

import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanList({
  handymen,
  language,
}: Readonly<{
  handymen: ReadonlyArray<{
    id: string;
    name: string;
    phone: string;
    trades: ReadonlyArray<HandymanTrade>;
  }>;
  language: UserLanguage;
}>) {
  const { handymen: text, issue: issueText } = MANAGER_TEXT[language];

  if (handymen.length === 0) {
    return <p className="text-sm opacity-70">{text.empty}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {handymen.map((handyman) => (
        <li key={handyman.id}>
          <Link
            href={`/handymen/${handyman.id}`}
            className="flex flex-col gap-1 py-3"
          >
            <span className="font-medium">{handyman.name}</span>
            <span className="text-sm">{handyman.phone}</span>
            <span className="text-sm opacity-70">
              {handyman.trades
                .map((trade) => issueText.trades[trade])
                .join(", ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
