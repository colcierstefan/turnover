import { z } from "zod";

export const createUnitInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(300),
});
export type CreateUnitInput = z.infer<typeof createUnitInputSchema>;

export const updateUnitInputSchema = createUnitInputSchema.extend({
  unitId: z.uuid(),
});
export type UpdateUnitInput = z.infer<typeof updateUnitInputSchema>;

export const unitIdInputSchema = z.object({
  unitId: z.uuid(),
});
export type UnitIdInput = z.infer<typeof unitIdInputSchema>;
