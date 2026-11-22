import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { generateText, Output } from "ai";
import { z } from "zod";

import env from "@turnover/core/config/env.config";
import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import vertex from "@turnover/core/lib/vertex";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

try {
  const plain = await generateText({
    model: vertex(env.vertex.modelId),
    output: Output.object({
      schema: z.object({ category: z.string(), likelyCause: z.string() }),
    }),
    prompt:
      "A guest reports: the washing machine stops mid-cycle and shows error E21. Classify the appliance and give the likely cause.",
    telemetry: { functionId: "check-vertex-plain" },
  });
  logger.info({ data: plain.output, usage: plain.usage }, "plain");

  const grounded = await generateText({
    model: vertex(env.vertex.modelId),
    output: Output.object({
      schema: z.object({
        items: z.array(
          z.object({
            item: z.string(),
            priceRon: z.number(),
            shopName: z.string(),
            sourceUrl: z.string(),
          }),
        ),
      }),
    }),
    tools: { googleSearch: vertex.tools.googleSearch({}) },
    prompt:
      "Find current prices in Romanian online shops for a drain pump for a Bosch Serie 4 WAN28262BY washing machine. Prices in RON.",
    telemetry: { functionId: "check-vertex-grounded" },
  });
  logger.info({ data: grounded.output, usage: grounded.usage }, "grounded");
  logger.info(
    {
      sources: grounded.sources.map((source) =>
        source.sourceType === "url" ? source.url : source.title,
      ),
    },
    "grounding sources",
  );
} finally {
  await langfuseSpanProcessor.forceFlush();
}
