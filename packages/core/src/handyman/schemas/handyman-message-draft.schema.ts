import { z } from "zod";

import {
  ApplianceCategory,
  HandymanTrade,
  UserLanguage,
} from "@turnover/db/enums";

export const handymanMessageDraftInputSchema = z.object({
  unitAddress: z.string().min(1),
  appliance: z
    .object({
      category: z.enum(ApplianceCategory),
      brand: z.string().nullable(),
      model: z.string().nullable(),
    })
    .nullable(),
  description: z.string().min(1),
  likelyCause: z.string().nullable(),
  trade: z.enum(HandymanTrade).nullable(),
  recipientName: z.string().nullable(),
  managerLanguage: z.enum(UserLanguage),
});
export type HandymanMessageDraftInput = z.infer<
  typeof handymanMessageDraftInputSchema
>;

const romanianDraftSchema = z.object({
  textRo: z.string().min(1).describe("The WhatsApp message in Romanian."),
});

const bilingualDraftSchema = romanianDraftSchema.extend({
  textEn: z
    .string()
    .min(1)
    .describe(
      "The same message in English, sentence by sentence, for the manager to read and edit.",
    ),
});

export const buildHandymanMessageDraftOutputSchema = (
  managerLanguage: UserLanguage,
) => (managerLanguage === "EN" ? bilingualDraftSchema : romanianDraftSchema);

export const handymanMessageDraftSchema = z.object({
  textRo: z.string(),
  textEn: z.string().nullable(),
});
export type HandymanMessageDraft = z.infer<typeof handymanMessageDraftSchema>;
