import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { z } from "zod";

import { langfuseSpanProcessor } from "@turnover/core/lib/langfuse";
import logger from "@turnover/core/lib/logger";
import { generateStructured } from "@turnover/core/utils/model.utils";

new NodeTracerProvider({ spanProcessors: [langfuseSpanProcessor] }).register();

try {
  const plain = await generateStructured({
    name: "check-vertex-plain",
    schema: z.object({ category: z.string(), likelyCause: z.string() }),
    contents:
      "A guest reports: the washing machine stops mid-cycle and shows error E21. Classify the appliance and give the likely cause.",
  });
  logger.info({ data: plain.data }, "plain");

  const grounded = await generateStructured({
    name: "check-vertex-grounded",
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
    contents:
      "Find current prices in Romanian online shops for a drain pump for a Bosch Serie 4 WAN28262BY washing machine. Prices in RON.",
    config: { tools: [{ googleSearch: {} }] },
  });
  logger.info({ data: grounded.data }, "grounded");
  logger.info(
    {
      sources:
        grounded.response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(
          (chunk) => chunk.web?.uri,
        ),
    },
    "grounding sources",
  );
} finally {
  await langfuseSpanProcessor.forceFlush();
}
