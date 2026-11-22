import type { HandymanMessageTranslationInput } from "@turnover/core/handyman/schemas/handyman-message-translation.schema";

export const buildHandymanMessageTranslationPrompt = (
  input: HandymanMessageTranslationInput,
) =>
  `Translate this WhatsApp message from the manager of a short-term rental apartment in Romania to a handyman into Romanian. Keep its meaning, its tone and every detail (address, brand, model, names, days and times). Add nothing and leave nothing out. Write correct, natural Romanian with diacritics, using the polite form (dumneavoastră).

Message: """${input.textEn}"""`;
