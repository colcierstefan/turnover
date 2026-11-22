import Link from "next/link";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitList({
  units,
  language,
}: Readonly<{
  units: ReadonlyArray<{ id: string; name: string; address: string }>;
  language: UserLanguage;
}>) {
  if (units.length === 0) {
    return (
      <p className="text-sm opacity-70">{MANAGER_TEXT[language].units.empty}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {units.map((unit) => (
        <li key={unit.id}>
          <Link
            href={`/units/${unit.id}`}
            className="flex flex-col rounded-lg border border-foreground/10 p-4"
          >
            <span className="font-medium">{unit.name}</span>
            <span className="text-sm opacity-70">{unit.address}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
