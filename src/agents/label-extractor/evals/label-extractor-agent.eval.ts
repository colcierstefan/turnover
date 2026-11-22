import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

import {
  loadLabelEvalCases,
  WEB_IMAGES_DIR,
  type LabelEvalCase,
} from "@/agents/label-extractor/evals/label-extractor-agent.dataset";
import { scoreLabelExtraction } from "@/agents/label-extractor/evals/label-extractor-agent.evaluators";
import { extractLabel } from "@/agents/label-extractor/label-extractor.agent";
import { labelExtractorInputSchema } from "@/agents/label-extractor/schemas/label-extractor.schema";
import { langfuseSpanProcessor } from "@/lib/langfuse";
import logger from "@/lib/logger";
import {
  fetchGenerationUsage,
  parseEvalArgs,
  selectEvalCases,
  summarizeFieldScores,
  uploadEvalFile,
} from "@/utils/eval.utils";

const AGENT_NAME = "label-extractor";
const DOWNLOAD_USER_AGENT = "Mozilla/5.0 (compatible; turnover-evals/0.1)";
const IMAGE_TYPES = [
  ["jpg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
] as const;
const FAILED_SCORE = {
  category: false,
  brand: false,
  model: false,
  serialNumber: false,
  manufactureDate: false,
};

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

const startedAt = new Date();
const cases = selectEvalCases(
  await loadLabelEvalCases(),
  parseEvalArgs(process.argv),
);
await mkdir(WEB_IMAGES_DIR, { recursive: true });

const scores = [];
const skippedIds = [];
try {
  for (const evalCase of cases) {
    const image = await ensureLocalImage(evalCase);
    if (!image) {
      skippedIds.push(evalCase.id);
      continue;
    }
    const { localPath, contentType } = image;
    const fileUri = await uploadEvalFile(
      AGENT_NAME,
      path.basename(localPath),
      localPath,
      contentType,
    );
    const actual = await extractLabel(
      labelExtractorInputSchema.parse({ fileUri, contentType }),
    ).catch((error: unknown) => {
      logger.error({ id: evalCase.id, err: error }, "extraction failed");
      return null;
    });
    const score = actual
      ? scoreLabelExtraction(evalCase.expected, actual)
      : FAILED_SCORE;
    scores.push(score);
    const misses = Object.entries(score)
      .filter(([, isCorrect]) => !isCorrect)
      .map(([field]) => ({
        field,
        expected: evalCase.expected[field as keyof typeof score],
        actual: actual?.[field as keyof typeof score],
      }));
    logger.info({ id: evalCase.id, misses }, misses.length ? "miss" : "ok");
  }
} finally {
  await langfuseSpanProcessor.forceFlush();
}

logger.info(
  {
    cases: scores.length,
    skippedIds,
    accuracy: summarizeFieldScores(scores),
  },
  "per-field accuracy",
);
logger.info(
  await fetchGenerationUsage(AGENT_NAME, startedAt, scores.length),
  "usage from Langfuse",
);

async function ensureLocalImage(evalCase: LabelEvalCase) {
  if (!("imageUrl" in evalCase) || !evalCase.imageUrl) {
    return { localPath: evalCase.localPath, contentType: "image/jpeg" };
  }
  for (const [extension, contentType] of IMAGE_TYPES) {
    const localPath = `${evalCase.localPath}.${extension}`;
    if (await exists(localPath)) return { localPath, contentType };
  }

  const response = await fetch(evalCase.imageUrl, {
    headers: { "user-agent": DOWNLOAD_USER_AGENT },
  });
  if (!response.ok) {
    logger.warn(
      { id: evalCase.id, status: response.status },
      "image download failed, case skipped",
    );
    return null;
  }
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const extension = IMAGE_TYPES.find(([, type]) => type === contentType)?.[0];
  if (!extension) throw new Error(`${evalCase.id}: unexpected ${contentType}`);
  const localPath = `${evalCase.localPath}.${extension}`;
  await writeFile(localPath, Buffer.from(await response.arrayBuffer()));
  return { localPath, contentType };
}

async function exists(filePath: string) {
  return access(filePath).then(
    () => true,
    () => false,
  );
}
