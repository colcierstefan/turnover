import "server-only";

import type { ContentListUnion, GenerateContentConfig } from "@google/genai";
import { startActiveObservation } from "@langfuse/tracing";
import { z } from "zod";

import env from "@/config/env.config";
import vertex from "@/lib/vertex";

export async function generateStructured<Schema extends z.ZodType>({
  name,
  schema,
  contents,
  config,
}: {
  name: string;
  schema: Schema;
  contents: ContentListUnion;
  config?: GenerateContentConfig;
}) {
  const model = env.vertex.modelId;

  return startActiveObservation(
    name,
    async (generation) => {
      generation.update({ model, input: contents });

      const response = await vertex.models.generateContent({
        model,
        contents,
        config: {
          ...config,
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(schema),
        },
      });

      if (!response.text) throw new Error(`${name}: model returned no text`);
      const data: z.infer<Schema> = schema.parse(JSON.parse(response.text));

      generation.update({
        output: data,
        usageDetails: {
          input: response.usageMetadata?.promptTokenCount ?? 0,
          output: response.usageMetadata?.candidatesTokenCount ?? 0,
          total: response.usageMetadata?.totalTokenCount ?? 0,
        },
      });

      return { data, response };
    },
    { asType: "generation" },
  );
}
