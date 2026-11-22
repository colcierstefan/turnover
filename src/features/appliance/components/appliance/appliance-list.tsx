import Link from "next/link";

import { APPLIANCE_CATEGORY_LABELS } from "@/features/appliance/constants/appliance.constants";
import type { ApplianceCategory } from "@/generated/prisma/enums";

export default function ApplianceList({
  unitId,
  appliances,
}: Readonly<{
  unitId: string;
  appliances: ReadonlyArray<{
    id: string;
    category: ApplianceCategory;
    brand: string | null;
    model: string | null;
  }>;
}>) {
  if (appliances.length === 0) {
    return <p className="text-sm opacity-70">No appliances yet.</p>;
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
              {APPLIANCE_CATEGORY_LABELS[appliance.category]}
            </span>
            <span className="text-sm opacity-70">
              {[appliance.brand, appliance.model].filter(Boolean).join(" ") ||
                "No brand or model"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
