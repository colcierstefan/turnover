import { z } from "zod";

export const handymanMessageTranslationInputSchema = z.object({
  textEn: z.string().min(1),
});
export type HandymanMessageTranslationInput = z.infer<
  typeof handymanMessageTranslationInputSchema
>;

export const handymanMessageTranslationOutputSchema = z.object({
  textRo: z.string().min(1).describe("The message translated into Romanian."),
});
export type HandymanMessageTranslationOutput = z.infer<
  typeof handymanMessageTranslationOutputSchema
>;
