import "server-only";

import { generateText, Output } from "ai";

import env from "@turnover/core/config/env.config";
import { buildHandymanMessageTranslationPrompt } from "@turnover/core/handyman/prompts/handyman-message-translation.prompts";
import {
  handymanMessageTranslationOutputSchema,
  type HandymanMessageTranslationInput,
} from "@turnover/core/handyman/schemas/handyman-message-translation.schema";
import vertex from "@turnover/core/lib/vertex";

class HandymanMessageTranslationService {
  async translate(input: HandymanMessageTranslationInput) {
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({ schema: handymanMessageTranslationOutputSchema }),
      prompt: buildHandymanMessageTranslationPrompt(input),
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "handyman-message-translation" },
    });
    return output;
  }
}

const handymanMessageTranslationService =
  new HandymanMessageTranslationService();
export default handymanMessageTranslationService;
