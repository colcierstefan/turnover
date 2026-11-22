import "server-only";

import { LangfuseSpanProcessor } from "@langfuse/otel";

import env from "@turnover/core/config/env.config";

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  publicKey: env.langfuse.publicKey,
  secretKey: env.langfuse.secretKey,
  baseUrl: env.langfuse.baseUrl,
});
