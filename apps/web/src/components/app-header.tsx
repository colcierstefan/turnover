import Link from "next/link";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function AppHeader({
  language,
}: Readonly<{ language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].header;

  return (
    <header className="flex items-center gap-4 border-b border-foreground/10 px-6 py-3 text-sm">
      <Link href="/units" className="font-semibold">
        Turnover
      </Link>
      <nav className="flex flex-1 gap-4">
        <Link href="/units">{text.units}</Link>
        <Link href="/issues">{text.issues}</Link>
        <Link href="/team">{text.team}</Link>
        <Link href="/settings">{text.settings}</Link>
      </nav>
      <a href="/auth/logout">{text.logOut}</a>
    </header>
  );
}
