import type { HandymanMessageDraftInput } from "@turnover/core/handyman/schemas/handyman-message-draft.schema";

export const buildHandymanMessageDraftPrompt = (
  input: HandymanMessageDraftInput,
) =>
  `You write a WhatsApp message from the manager of a short-term rental apartment in Romania to a handyman, asking them to come and fix a problem. The manager sends it from their own phone.

Apartment address: ${input.unitAddress}
Appliance: ${
    input.appliance
      ? [input.appliance.category, input.appliance.brand, input.appliance.model]
          .filter(Boolean)
          .join(" ")
      : "none, the problem is not about a listed appliance"
  }
What was reported: """${input.description}"""${
    input.likelyCause ? `\nLikely cause: ${input.likelyCause}` : ""
  }${input.trade ? `\nTrade needed: ${input.trade}` : ""}
Handyman's name: ${input.recipientName ?? "not known"}

Write textRo, the message in Romanian:
- Greet the handyman politely, by name when it is known.
- Give the full apartment address as written above, including the city.
- When there is an appliance, name it with its brand and model exactly as written above.
- Describe the problem in plain words: what is wrong and what happens. Mention the likely cause only as a guess.
- Do not tell the handyman which trade the job needs; the trade is only context for you.
- Ask when they could come to look at it.
- Keep it short, three to six sentences. No sign-off with a name, no placeholders, no emojis.
- Leave out who reported the problem and everything about guests: their names, their stay, check-in or check-out. Leave out prices and costs.
- Write correct, natural Romanian with diacritics, using the polite form (dumneavoastră).${
    input.managerLanguage === "EN"
      ? "\n\nAlso write textEn: the same message in English, sentence by sentence, so the manager can read and edit it."
      : ""
  }`;
