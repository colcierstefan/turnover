import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import { loadHandymanMessageTranslationEvalCases } from "@turnover/core/handyman/evals/handyman-message-translation.dataset";
import {
  HANDYMAN_MESSAGE_TRANSLATION_JUDGE_NAME,
  scoreTranslation,
} from "@turnover/core/handyman/evals/handyman-message-translation.evaluators";
import { handymanMessageTranslationInputSchema } from "@turnover/core/handyman/schemas/handyman-message-translation.schema";
import handymanMessageTranslationService from "@turnover/core/handyman/services/handyman-message-translation.service";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

const CALL_NAME = "handyman-message-translation";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const cases = selectEvalCases(
  await loadHandymanMessageTranslationEvalCases(),
  parseEvalArgs(process.argv),
);

const scores = [];
try {
  for (const evalCase of cases) {
    const translation = await handymanMessageTranslationService
      .translate(
        handymanMessageTranslationInputSchema.parse({
          textEn: evalCase.textEn,
        }),
      )
      .catch((error: unknown) => {
        logger.error({ id: evalCase.id, err: error }, "translation failed");
        return null;
      });
    if (!translation) {
      scores.push({ parsed: false });
      continue;
    }
    const { score, problems } = await scoreTranslation(
      evalCase,
      translation.textRo,
    );
    scores.push({ parsed: true, ...score });
    logger.info(
      { id: evalCase.id, textRo: translation.textRo, score, problems },
      Object.values(score).every(Boolean) ? "ok" : "miss",
    );
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  { cases: scores.length, accuracy: summarizeFieldScores(scores) },
  `${CALL_NAME} results`,
);
logger.info(
  {
    translation: await fetchModelCallUsage(CALL_NAME, startedAt, cases.length),
    judge: await fetchModelCallUsage(
      HANDYMAN_MESSAGE_TRANSLATION_JUDGE_NAME,
      startedAt,
      scores.length,
    ),
  },
  "usage from Langfuse",
);
