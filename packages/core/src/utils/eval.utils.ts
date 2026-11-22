import "server-only";

import { readFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { z } from "zod";

import env from "@turnover/core/config/env.config";
import { bucket } from "@turnover/core/lib/storage";

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
      traceId: z.string(),
      inputUsage: z.number(),
      outputUsage: z.number(),
      totalCost: z.number().nullable(),
    }),
  ),
});
type Observation = z.infer<typeof observationsResponseSchema>["data"][number];

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
  callName: string,
  fileName: string,
  localPath: string,
  contentType: string,
) => {
  const file = bucket.file(`evals/${callName}/${fileName}`);
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

export const fetchModelCallUsage = async (
  callName: string,
  fromStartTime: Date,
  expectedCount: number,
) => {
  let generations: Observation[] = [];
  for (let attempt = 0; attempt < LANGFUSE_POLL_ATTEMPTS; attempt++) {
    const callTraceIds = new Set(
      (
        await fetchObservations({
          type: "AGENT",
          name: `invoke_agent ${callName}`,
          fromStartTime,
        })
      ).map((observation) => observation.traceId),
    );
    generations = (
      await fetchObservations({ type: "GENERATION", fromStartTime })
    ).filter((observation) => callTraceIds.has(observation.traceId));
    if (generations.length >= expectedCount) break;
    await sleep(LANGFUSE_POLL_INTERVAL_MS);
  }

  return {
    calls: generations.length,
    inputTokens: sum(generations.map((observation) => observation.inputUsage)),
    outputTokens: sum(
      generations.map((observation) => observation.outputUsage),
    ),
    totalCostUsd: sum(
      generations.map((observation) => observation.totalCost ?? 0),
    ),
  };
};

const fetchObservations = async ({
  type,
  name,
  fromStartTime,
}: Readonly<{ type: string; name?: string; fromStartTime: Date }>) => {
  const url = new URL("/api/public/v2/observations", env.langfuse.baseUrl);
  url.search = new URLSearchParams({
    type,
    ...(name ? { name } : {}),
    fromStartTime: fromStartTime.toISOString(),
    fields: "core,usage",
    limit: "100",
  }).toString();
  const authorization = `Basic ${Buffer.from(`${env.langfuse.publicKey}:${env.langfuse.secretKey}`).toString("base64")}`;
  const response = await fetch(url, { headers: { authorization } });
  return observationsResponseSchema.parse(await response.json()).data;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFKC")
    .replaceAll("’", "'")
    .replace(/\s+/g, "")
    .toUpperCase();

const sum = (values: ReadonlyArray<number>) =>
  values.reduce((total, value) => total + value, 0);
