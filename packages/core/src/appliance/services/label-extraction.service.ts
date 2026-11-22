import "server-only";

import { generateText, Output } from "ai";

import { buildLabelExtractionPrompt } from "@turnover/core/appliance/prompts/label-extraction.prompts";
import {
  labelExtractionOutputSchema,
  type LabelExtractionInput,
} from "@turnover/core/appliance/schemas/label-extraction.schema";
import env from "@turnover/core/config/env.config";
import vertex from "@turnover/core/lib/vertex";

class LabelExtractionService {
  async extract(input: LabelExtractionInput) {
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({ schema: labelExtractionOutputSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: new URL(input.fileUri),
              mediaType: input.contentType,
            },
            { type: "text", text: buildLabelExtractionPrompt() },
          ],
        },
      ],
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "label-extraction" },
    });
    return output;
  }
}

const labelExtractionService = new LabelExtractionService();
export default labelExtractionService;
