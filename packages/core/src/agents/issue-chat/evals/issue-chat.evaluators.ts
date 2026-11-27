import type { IssueChatEvalCase } from "@turnover/core/agents/issue-chat/evals/issue-chat.dataset";

export type IssueChatAnswer = Readonly<{
  text: string;
  toolNames: ReadonlyArray<string>;
  toolResults: string;
}>;

const ROMANIAN_LETTERS = /[ăâîșțşţ]/i;
const NUMBER_PATTERN = /\d{1,3}(?:[.,   ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g;

export const scoreIssueChatAnswer = (
  evalCase: IssueChatEvalCase,
  answer: IssueChatAnswer,
  otherOrganizationTexts: ReadonlyArray<string>,
) => {
  const answerNumbers = readNumbers(answer.text);
  const text = normalize(answer.text);
  const missingNumbers = evalCase.numbers.filter(
    (number) => !answerNumbers.has(number),
  );
  const missingMentions = evalCase.mentions.filter(
    (mention) => !text.includes(normalize(mention)),
  );
  const forbiddenFound = evalCase.forbidden.filter((forbidden) =>
    text.includes(normalize(forbidden)),
  );
  const missingTools = evalCase.tools.filter(
    (tool) => !answer.toolNames.includes(tool),
  );
  const leakedToTools = otherOrganizationTexts.filter((leak) =>
    answer.toolResults.includes(leak),
  );
  const isInLanguage =
    ROMANIAN_LETTERS.test(answer.text) === (evalCase.language === "RO");
  return {
    score: {
      numbers: missingNumbers.length === 0,
      mentions: missingMentions.length === 0,
      forbidden: forbiddenFound.length === 0,
      tools: missingTools.length === 0,
      noOtherOrganizationData: leakedToTools.length === 0,
      language: isInLanguage,
    },
    problems: {
      missingNumbers,
      missingMentions,
      forbiddenFound,
      missingTools,
      leakedToTools,
    },
  };
};

// "1.780,50" (Romanian) and "1,780.50" (English) both read as 1780.5; an ambiguous "2,930" reads as both 2930 and 2.93.
const readNumbers = (text: string) => {
  const numbers = new Set<number>();
  for (const [digits] of text.matchAll(/\d+/g)) numbers.add(Number(digits));
  for (const [match] of text.matchAll(NUMBER_PATTERN)) {
    for (const candidate of readNumberCandidates(
      match.replace(/[\s  ]/g, ""),
    )) {
      numbers.add(candidate);
    }
  }
  return numbers;
};

const readNumberCandidates = (token: string) => {
  const lastDot = token.lastIndexOf(".");
  const lastComma = token.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? "." : ",";
    const group = decimal === "." ? "," : ".";
    return [Number(token.replaceAll(group, "").replace(decimal, "."))];
  }
  const separator = lastDot >= 0 ? "." : lastComma >= 0 ? "," : null;
  if (!separator) return [Number(token)];
  return [
    Number(token.replaceAll(separator, "")),
    Number(token.replace(separator, ".")),
  ].filter(Number.isFinite);
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
