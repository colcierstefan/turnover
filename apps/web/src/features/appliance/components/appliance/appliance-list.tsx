import Link from "next/link";

import type { ApplianceCategory } from "@turnover/core/appliance/constants/appliance.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function ApplianceList({
  unitId,
  appliances,
  language,
}: Readonly<{
  unitId: string;
  appliances: ReadonlyArray<{
    id: string;
    category: ApplianceCategory;
    brand: string | null;
    model: string | null;
  }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].appliance;

  if (appliances.length === 0) {
    return <p className="text-sm opacity-70">{text.empty}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {appliances.map((appliance) => (
        <li key={appliance.id}>
          <Link
            href={`/units/${unitId}/appliances/${appliance.id}`}
            className="flex flex-col py-3"
          >
            <span className="font-medium">
              {text.categories[appliance.category]}
            </span>
            <span className="text-sm opacity-70">
              {[appliance.brand, appliance.model].filter(Boolean).join(" ") ||
                text.noBrandOrModel}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
