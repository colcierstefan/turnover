import "server-only";

import { generateText, Output } from "ai";

import env from "@turnover/core/config/env.config";
import { buildHandymanMessageDraftPrompt } from "@turnover/core/handyman/prompts/handyman-message-draft.prompts";
import {
  buildHandymanMessageDraftOutputSchema,
  handymanMessageDraftSchema,
  type HandymanMessageDraftInput,
} from "@turnover/core/handyman/schemas/handyman-message-draft.schema";
import vertex from "@turnover/core/lib/vertex";

class HandymanMessageDraftService {
  async draft(input: HandymanMessageDraftInput) {
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({
        schema: buildHandymanMessageDraftOutputSchema(input.managerLanguage),
      }),
      prompt: buildHandymanMessageDraftPrompt(input),
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "handyman-message-draft" },
    });
    return handymanMessageDraftSchema.parse({ textEn: null, ...output });
  }
}

const handymanMessageDraftService = new HandymanMessageDraftService();
export default handymanMessageDraftService;
