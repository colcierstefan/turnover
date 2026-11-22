import "server-only";

import { generateText, Output } from "ai";

import env from "@turnover/core/config/env.config";
import { buildSelfHelpTipsPrompt } from "@turnover/core/issue/prompts/self-help-tips.prompts";
import {
  selfHelpTipsOutputSchema,
  type SelfHelpTipsInput,
} from "@turnover/core/issue/schemas/self-help-tips.schema";
import vertex from "@turnover/core/lib/vertex";

class SelfHelpTipsService {
  async suggest(input: SelfHelpTipsInput) {
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({ schema: selfHelpTipsOutputSchema }),
      prompt: buildSelfHelpTipsPrompt(input),
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "self-help-tips" },
    });
    return output;
  }
}

const selfHelpTipsService = new SelfHelpTipsService();
export default selfHelpTipsService;
