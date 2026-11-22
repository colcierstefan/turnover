import "server-only";

import { readFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { z } from "zod";

import env from "@/config/env.config";
import { bucket } from "@/lib/storage";

export type ExpectedValue<Value> = Value | null | ReadonlyArray<Value | null>;

export type FieldAccuracy = Record<
  string,
  { correct: number; total: number; accuracy: string }
>;

const LANGFUSE_POLL_ATTEMPTS = 20;
const LANGFUSE_POLL_INTERVAL_MS = 3000;

const observationsResponseSchema = z.object({
  data: z.array(
    z.object({
      inputUsage: z.number(),
      outputUsage: z.number(),
      totalCost: z.number().nullable(),
    }),
  ),
});

export const parseEvalArgs = (argv: ReadonlyArray<string>) => {
  const limitIndex = argv.indexOf("--limit");
  const onlyIndex = argv.indexOf("--only");
  return {
    limit: limitIndex >= 0 ? Number(argv[limitIndex + 1]) : undefined,
    only: onlyIndex >= 0 ? argv[onlyIndex + 1].split(",") : undefined,
  };
};

export const selectEvalCases = <EvalCase extends { id: string }>(
  cases: ReadonlyArray<EvalCase>,
  args: Readonly<{ limit?: number; only?: ReadonlyArray<string> }>,
) => {
  const selected = args.only
    ? cases.filter((evalCase) => args.only?.includes(evalCase.id))
    : cases;
  return selected.slice(0, args.limit ?? selected.length);
};

export const uploadEvalFile = async (
  agentName: string,
  fileName: string,
  localPath: string,
  contentType: string,
) => {
  const file = bucket.file(`evals/${agentName}/${fileName}`);
  const [exists] = await file.exists();
  if (!exists) await file.save(await readFile(localPath), { contentType });
  return `gs://${bucket.name}/${file.name}`;
};

export const matchesExpected = <Value>(
  expected: ExpectedValue<Value>,
  actual: Value | null,
  isEqual: (expected: Value, actual: Value) => boolean,
) => {
  const accepted = Array.isArray(expected) ? expected : [expected];
  return accepted.some((value: Value | null) =>
    value === null || actual === null
      ? value === actual
      : isEqual(value, actual),
  );
};

export const isSameText = (expected: string, actual: string) =>
  normalizeText(expected) === normalizeText(actual);

export const summarizeFieldScores = (
  scores: ReadonlyArray<Record<string, boolean>>,
): FieldAccuracy => {
  const summary: FieldAccuracy = {};
  for (const score of scores) {
    for (const [field, isCorrect] of Object.entries(score)) {
      const entry = summary[field] ?? { correct: 0, total: 0, accuracy: "" };
      entry.correct += isCorrect ? 1 : 0;
      entry.total += 1;
      entry.accuracy = `${Math.round((entry.correct / entry.total) * 100)}%`;
      summary[field] = entry;
    }
  }
  return summary;
};

export const fetchGenerationUsage = async (
  generationName: string,
  fromStartTime: Date,
  expectedCount: number,
) => {
  const url = new URL("/api/public/v2/observations", env.langfuse.baseUrl);
  url.search = new URLSearchParams({
    type: "GENERATION",
    name: generationName,
    fromStartTime: fromStartTime.toISOString(),
    fields: "core,usage",
    limit: "100",
  }).toString();
  const authorization = `Basic ${Buffer.from(`${env.langfuse.publicKey}:${env.langfuse.secretKey}`).toString("base64")}`;

  let observations: z.infer<typeof observationsResponseSchema>["data"] = [];
  for (let attempt = 0; attempt < LANGFUSE_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(url, { headers: { authorization } });
    observations = observationsResponseSchema.parse(await response.json()).data;
    if (observations.length >= expectedCount) break;
    await sleep(LANGFUSE_POLL_INTERVAL_MS);
  }

  return {
    calls: observations.length,
    inputTokens: sum(observations.map((observation) => observation.inputUsage)),
    outputTokens: sum(
      observations.map((observation) => observation.outputUsage),
    ),
    totalCostUsd: sum(
      observations.map((observation) => observation.totalCost ?? 0),
    ),
  };
};

const normalizeText = (value: string) =>
  value
    .normalize("NFKC")
    .replaceAll("’", "'")
    .replace(/\s+/g, "")
    .toUpperCase();

const sum = (values: ReadonlyArray<number>) =>
  values.reduce((total, value) => total + value, 0);
