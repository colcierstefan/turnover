import { z } from "zod";

import { UserLanguage } from "@turnover/db/enums";

export const chooseUserLanguageInputSchema = z.object({
  language: z.enum(UserLanguage),
  returnTo: z
    .string()
    .regex(/^\/(?![/\\])/)
    .optional(),
});
export type ChooseUserLanguageInput = z.infer<
  typeof chooseUserLanguageInputSchema
>;
