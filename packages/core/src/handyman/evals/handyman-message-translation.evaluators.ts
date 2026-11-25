import { generateText, Output } from "ai";
import { z } from "zod";

import env from "@turnover/core/config/env.config";
import type { TranslationEvalCase } from "@turnover/core/handyman/evals/handyman-message-translation.dataset";
import vertex from "@turnover/core/lib/vertex";

export const HANDYMAN_MESSAGE_TRANSLATION_JUDGE_NAME =
  "handyman-message-translation-judge";

const translationJudgeSchema = z.object({
  hasSameMeaning: z
    .boolean()
    .describe(
      "True when the Romanian says everything the English says, adds nothing and leaves nothing out. A changed day, time, number, negation or request makes it false.",
    ),
  isCorrectRomanian: z
    .boolean()
    .describe(
      "True when the Romanian is grammatical, uses diacritics, is polite and reads like a native speaker wrote it.",
    ),
  problems: z
    .array(z.string())
    .describe(
      "Each mistake in the message that made one of the checks above fail, one short sentence each. Empty when every check passes.",
    ),
});

export const scoreTranslation = async (
  evalCase: TranslationEvalCase,
  textRo: string,
) => {
  const judgement = await judgeTranslation(evalCase.textEn, textRo);
  return {
    score: {
      keepsDetails: evalCase.mustContain.every((part) =>
        containsText(textRo, part),
      ),
      hasSameMeaning: judgement.hasSameMeaning,
      isCorrectRomanian: judgement.isCorrectRomanian,
    },
    problems: judgement.problems,
  };
};

const judgeTranslation = async (textEn: string, textRo: string) => {
  const { output } = await generateText({
    model: vertex(env.vertex.modelId),
    output: Output.object({ schema: translationJudgeSchema }),
    prompt: `You check a Romanian translation of a WhatsApp message a rental apartment manager will send to a handyman. Read both texts sentence by sentence.

English: """${textEn}"""
Romanian: """${textRo}"""`,
    providerOptions: {
      vertex: { thinkingConfig: { thinkingLevel: "low" } },
    },
    telemetry: { functionId: HANDYMAN_MESSAGE_TRANSLATION_JUDGE_NAME },
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
