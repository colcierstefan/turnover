import { generateText, Output } from "ai";
import { z } from "zod";

import env from "@turnover/core/config/env.config";
import type { DraftEvalCase } from "@turnover/core/handyman/evals/handyman-message-draft.dataset";
import type { HandymanMessageDraft } from "@turnover/core/handyman/schemas/handyman-message-draft.schema";
import vertex from "@turnover/core/lib/vertex";

export const HANDYMAN_MESSAGE_JUDGE_NAME = "handyman-message-judge";

const RON_AMOUNT_PATTERN = /\d[\d.,\s]*\s*(lei|ron)\b/i;

const draftJudgeSchema = z.object({
  describesProblem: z
    .boolean()
    .describe(
      "True when the message describes the reported problem correctly and in plain words a handyman understands.",
    ),
  asksWhenTheyCanCome: z
    .boolean()
    .describe("True when the message asks when the handyman could come."),
  mentionsGuestOrPrice: z
    .boolean()
    .describe(
      "True when the message mentions who reported the problem, a guest, their stay, check-in or check-out, or any price or cost.",
    ),
  isCorrectRomanian: z
    .boolean()
    .describe(
      "True when the Romanian is grammatical, uses diacritics, is polite and reads like a native speaker wrote it.",
    ),
  isFaithfulEnglish: z
    .boolean()
    .nullable()
    .describe(
      "When an English version is given: true when it says the same as the Romanian. Null when there is none.",
    ),
  problems: z
    .array(z.string())
    .describe(
      "Each mistake in the message that made one of the checks above fail, one short sentence each. Empty when every check passes.",
    ),
});

export const scoreDraft = async (
  evalCase: DraftEvalCase,
  appliance: Readonly<{ brand: string; model: string }> | null,
  draft: HandymanMessageDraft,
) => {
  const texts = [draft.textRo, draft.textEn ?? ""];
  const judgement = await judgeDraft(evalCase, draft);
  return {
    score: {
      hasAddress: evalCase.addressParts.every((part) =>
        containsText(draft.textRo, part),
      ),
      hasBrandAndModel:
        !appliance ||
        (containsText(draft.textRo, appliance.brand) &&
          containsText(draft.textRo, appliance.model)),
      hasNoRonAmount: texts.every((text) => !RON_AMOUNT_PATTERN.test(text)),
      hasNoGuestName:
        !evalCase.guestName ||
        texts.every((text) => !containsText(text, evalCase.guestName ?? "")),
      hasEnglishExactlyForEnglishManager:
        (evalCase.managerLanguage === "EN") === (draft.textEn !== null),
      describesProblem: judgement.describesProblem,
      asksWhenTheyCanCome: judgement.asksWhenTheyCanCome,
      leavesOutGuestAndPrice: !judgement.mentionsGuestOrPrice,
      isCorrectRomanian: judgement.isCorrectRomanian,
      isFaithfulEnglish: judgement.isFaithfulEnglish ?? true,
    },
    problems: judgement.problems,
  };
};

const judgeDraft = async (
  evalCase: DraftEvalCase,
  draft: HandymanMessageDraft,
) => {
  const { output } = await generateText({
    model: vertex(env.vertex.modelId),
    output: Output.object({ schema: draftJudgeSchema }),
    prompt: `You check a WhatsApp message a rental apartment manager in Romania will send to a handyman.

What the reporter wrote: """${evalCase.description}"""
Likely cause: ${evalCase.likelyCause}

Romanian message: """${draft.textRo}"""${
      draft.textEn ? `\nEnglish version: """${draft.textEn}"""` : ""
    }`,
    providerOptions: {
      vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
    },
    telemetry: { functionId: HANDYMAN_MESSAGE_JUDGE_NAME },
  });
  return output;
};

const containsText = (text: string, part: string) =>
  normalizeText(text).includes(normalizeText(part));

const normalizeText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();
