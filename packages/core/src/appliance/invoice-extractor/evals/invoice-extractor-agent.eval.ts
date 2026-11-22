import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import { loadInvoiceEvalCases } from "@turnover/core/appliance/invoice-extractor/evals/invoice-extractor-agent.dataset";
import { scoreInvoiceExtraction } from "@turnover/core/appliance/invoice-extractor/evals/invoice-extractor-agent.evaluators";
import { extractInvoice } from "@turnover/core/appliance/invoice-extractor/invoice-extractor.agent";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import {
  fetchGenerationUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
  uploadEvalFile,
} from "@turnover/core/utils/eval.utils";

const AGENT_NAME = "invoice-extractor";
const CONTENT_TYPE = "application/pdf";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const cases = selectEvalCases(
  await loadInvoiceEvalCases(),
  parseEvalArgs(process.argv),
);

const scores = [];
try {
  for (const evalCase of cases) {
    const fileUri = await uploadEvalFile(
      AGENT_NAME,
      `${evalCase.id}.pdf`,
      evalCase.localPath,
      CONTENT_TYPE,
    );
    const actual = await extractInvoice({
      fileUri,
      contentType: CONTENT_TYPE,
    }).catch((error: unknown) => {
      logger.error({ id: evalCase.id, err: error }, "extraction failed");
      return { shopName: null, purchaseDate: null, items: [] };
    });
    const score = scoreInvoiceExtraction(evalCase.expected, actual);
    scores.push(score.invoice, ...score.items);
    const misses = [
      ...Object.entries(score.invoice),
      ...score.items.flatMap((item, index) =>
        Object.entries(item).map(
          ([field, isCorrect]) =>
            [field.replace("item.", `items[${index}].`), isCorrect] as const,
        ),
      ),
    ]
      .filter(([, isCorrect]) => !isCorrect)
      .map(([field]) => field);
    logger.info(
      { id: evalCase.id, misses, ...(misses.length ? { actual } : {}) },
      misses.length ? "miss" : "ok",
    );
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  {
    invoices: cases.length,
    items: scores.length - cases.length,
    accuracy: summarizeFieldScores(scores),
  },
  "per-field accuracy",
);
logger.info(
  await fetchGenerationUsage(AGENT_NAME, startedAt, cases.length),
  "usage from Langfuse",
);
