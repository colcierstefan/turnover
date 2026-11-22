import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

import { HandymanTrade } from "@turnover/db/enums";

const DEFAULT_PHONE_REGION = "RO";

export const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value, context) => {
    const phoneNumber = parsePhoneNumberFromString(value, DEFAULT_PHONE_REGION);
    if (!phoneNumber?.isValid()) {
      context.addIssue({ code: "custom", message: "Invalid phone number" });
      return z.NEVER;
    }
    return phoneNumber.number;
  });

export const createHandymanInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: phoneNumberSchema,
  trades: z.array(z.enum(HandymanTrade)).min(1),
  notes: z
    .string()
    .trim()
    .max(1000)
    .transform((value) => value || null),
});
export type CreateHandymanInput = z.infer<typeof createHandymanInputSchema>;

export const updateHandymanInputSchema = createHandymanInputSchema.extend({
  handymanId: z.uuid(),
});
export type UpdateHandymanInput = z.infer<typeof updateHandymanInputSchema>;

export const handymanIdInputSchema = z.object({
  handymanId: z.uuid(),
});
export type HandymanIdInput = z.infer<typeof handymanIdInputSchema>;

export const saveRecipientAsHandymanInputSchema =
  createHandymanInputSchema.extend({
    handymanMessageId: z.uuid(),
  });
export type SaveRecipientAsHandymanInput = z.infer<
  typeof saveRecipientAsHandymanInputSchema
>;

const recipientNameSchema = z
  .string()
  .trim()
  .max(100)
  .nullable()
  .transform((value) => value || null);

const recipientSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("HANDYMAN"), handymanId: z.uuid() }),
  z.object({
    kind: z.literal("PHONE"),
    phone: phoneNumberSchema,
    name: recipientNameSchema,
  }),
  z.object({ kind: z.literal("WHATSAPP_CHAT") }),
]);
export type HandymanMessageRecipient = z.infer<typeof recipientSchema>;

export const draftHandymanMessageInputSchema = z.object({
  issueId: z.uuid(),
  recipient: recipientSchema,
});
export type DraftHandymanMessageInput = z.infer<
  typeof draftHandymanMessageInputSchema
>;

export const translateHandymanMessageInputSchema = z.object({
  textEn: z.string().trim().min(1).max(2000),
});
export type TranslateHandymanMessageInput = z.infer<
  typeof translateHandymanMessageInputSchema
>;

export const recordHandymanMessageInputSchema = z.object({
  issueId: z.uuid(),
  recipient: recipientSchema,
  textRo: z.string().trim().min(1).max(2000),
  textEn: z.string().trim().min(1).max(2000).nullable(),
});
export type RecordHandymanMessageInput = z.infer<
  typeof recordHandymanMessageInputSchema
>;
