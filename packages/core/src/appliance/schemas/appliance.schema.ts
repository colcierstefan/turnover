import { z } from "zod";

import { PARTIAL_ISO_DATE_PATTERN } from "@turnover/core/utils/date.utils";
import { ApplianceCategory } from "@turnover/db/enums";

const optionalTextSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null);

const optionalDateSchema = z
  .union([z.literal(""), z.iso.date("Enter a valid date")])
  .transform((value) => value || null);

export const applianceFieldsSchema = z.object({
  category: z.enum(ApplianceCategory, "Choose a category"),
  brand: optionalTextSchema(100),
  model: optionalTextSchema(100),
  serialNumber: optionalTextSchema(100),
  manufactureDate: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(PARTIAL_ISO_DATE_PATTERN, "Use YYYY, YYYY-MM or YYYY-MM-DD"),
    ])
    .transform((value) => value || null),
  purchaseDate: optionalDateSchema,
  purchasePriceRon: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe(
      z.number("Enter a valid price").nonnegative().max(1_000_000).nullable(),
    ),
  warrantyUntil: optionalDateSchema,
  notes: optionalTextSchema(1000),
});
export type ApplianceFields = z.infer<typeof applianceFieldsSchema>;

export const createApplianceInputSchema = applianceFieldsSchema.extend({
  unitId: z.uuid(),
});
export type CreateApplianceInput = z.infer<typeof createApplianceInputSchema>;

export const updateApplianceInputSchema = applianceFieldsSchema.extend({
  applianceId: z.uuid(),
});
export type UpdateApplianceInput = z.infer<typeof updateApplianceInputSchema>;

export const applianceIdInputSchema = z.object({
  applianceId: z.uuid(),
});
export type ApplianceIdInput = z.infer<typeof applianceIdInputSchema>;
