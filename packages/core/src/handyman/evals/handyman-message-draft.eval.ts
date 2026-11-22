import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import { loadHandymanMessageEvalCases } from "@turnover/core/handyman/evals/handyman-message-draft.dataset";
import {
  HANDYMAN_MESSAGE_JUDGE_NAME,
  scoreDraft,
  scoreTranslation,
} from "@turnover/core/handyman/evals/handyman-message-draft.evaluators";
import { handymanMessageDraftInputSchema } from "@turnover/core/handyman/schemas/handyman-message-draft.schema";
import { handymanMessageTranslationInputSchema } from "@turnover/core/handyman/schemas/handyman-message-translation.schema";
import handymanMessageDraftService from "@turnover/core/handyman/services/handyman-message-draft.service";
import handymanMessageTranslationService from "@turnover/core/handyman/services/handyman-message-translation.service";
import { EVAL_UNIT_APPLIANCES } from "@turnover/core/issue/evals/issue-report.dataset";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchModelCallUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
} from "@turnover/core/utils/eval.utils";

const DRAFT_CALL_NAME = "handyman-message-draft";
const TRANSLATION_CALL_NAME = "handyman-message-translation";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const args = parseEvalArgs(process.argv);
const evalCases = await loadHandymanMessageEvalCases();
const draftCases = selectEvalCases(evalCases.draftCases, args);
const translationCases = selectEvalCases(evalCases.translationCases, args);

const draftScores = [];
const translationScores = [];
try {
  for (const evalCase of draftCases) {
    const appliance =
      EVAL_UNIT_APPLIANCES.find(
        ({ category }) => category === evalCase.applianceCategory,
      ) ?? null;
    const draft = await handymanMessageDraftService
      .draft(
        handymanMessageDraftInputSchema.parse({
          unitAddress: evalCase.unitAddress,
          appliance,
          description: evalCase.description,
          likelyCause: evalCase.likelyCause,
          trade: evalCase.trade,
          recipientName: evalCase.recipientName,
          managerLanguage: evalCase.managerLanguage,
        }),
      )
      .catch((error: unknown) => {
        logger.error({ id: evalCase.id, err: error }, "draft failed");
        return null;
      });
    if (!draft) {
      draftScores.push({ parsed: false });
      continue;
    }
    const { score, problems } = await scoreDraft(
      evalCase,
      appliance && {
        brand: appliance.brand ?? "",
        model: appliance.model ?? "",
      },
      draft,
    );
    draftScores.push({ parsed: true, ...score });
    logger.info(
      { id: evalCase.id, ...draft, score, problems },
      Object.values(score).every(Boolean) ? "ok" : "miss",
    );
  }

  for (const evalCase of translationCases) {
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
      translationScores.push({ parsed: false });
      continue;
    }
    const { score, problems } = await scoreTranslation(
      evalCase,
      translation.textRo,
    );
    translationScores.push({ parsed: true, ...score });
    logger.info(
      { id: evalCase.id, textRo: translation.textRo, score, problems },
      Object.values(score).every(Boolean) ? "ok" : "miss",
    );
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  {
    drafts: {
      cases: draftScores.length,
      accuracy: summarizeFieldScores(draftScores),
    },
    translations: {
      cases: translationScores.length,
      accuracy: summarizeFieldScores(translationScores),
    },
  },
  "handyman message results",
);
logger.info(
  {
    draft: await fetchModelCallUsage(
      DRAFT_CALL_NAME,
      startedAt,
      draftCases.length,
    ),
    translation: await fetchModelCallUsage(
      TRANSLATION_CALL_NAME,
      startedAt,
      translationCases.length,
    ),
    judge: await fetchModelCallUsage(
      HANDYMAN_MESSAGE_JUDGE_NAME,
      startedAt,
      draftScores.length + translationScores.length,
    ),
  },
  "usage from Langfuse",
);
