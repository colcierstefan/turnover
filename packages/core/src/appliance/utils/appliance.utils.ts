import type { ApplianceFields } from "@turnover/core/appliance/schemas/appliance.schema";
import { toIsoDate } from "@turnover/core/utils/date.utils";
import type { Prisma } from "@turnover/db/client";

export const toApplianceData = (fields: ApplianceFields) => ({
  ...fields,
  purchaseDate: fields.purchaseDate ? new Date(fields.purchaseDate) : null,
  warrantyUntil: fields.warrantyUntil ? new Date(fields.warrantyUntil) : null,
});

export const toApplianceView = <
  Appliance extends { purchasePriceRon: Prisma.Decimal | null },
>(
  appliance: Appliance,
) => ({
  ...appliance,
  purchasePriceRon: appliance.purchasePriceRon?.toNumber() ?? null,
});

export const toApplianceFormValues = (
  appliance: Readonly<{
    category: string;
    brand: string | null;
    model: string | null;
    serialNumber: string | null;
    manufactureDate: string | null;
    purchaseDate: Date | null;
    purchasePriceRon: number | null;
    warrantyUntil: Date | null;
    notes: string | null;
  }>,
): Record<keyof ApplianceFields, string> => ({
  category: appliance.category,
  brand: appliance.brand ?? "",
  model: appliance.model ?? "",
  serialNumber: appliance.serialNumber ?? "",
  manufactureDate: appliance.manufactureDate ?? "",
  purchaseDate: appliance.purchaseDate ? toIsoDate(appliance.purchaseDate) : "",
  purchasePriceRon: appliance.purchasePriceRon?.toString() ?? "",
  warrantyUntil: appliance.warrantyUntil
    ? toIsoDate(appliance.warrantyUntil)
    : "",
  notes: appliance.notes ?? "",
});
