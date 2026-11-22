import "server-only";

import { generateText, Output } from "ai";

import env from "@turnover/core/config/env.config";
import { buildIssueDiagnosisPrompt } from "@turnover/core/issue/prompts/issue-diagnosis.prompts";
import {
  buildIssueDiagnosisOutputSchema,
  type IssueDiagnosisInput,
} from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import vertex from "@turnover/core/lib/vertex";

class IssueDiagnosisService {
  async diagnose(input: IssueDiagnosisInput) {
    const { photos, ...issue } = input;
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({
        schema: buildIssueDiagnosisOutputSchema(
          issue.appliances.map((appliance) => appliance.id),
        ),
      }),
      messages: [
        {
          role: "user",
          content: [
            ...photos.map((photo) => ({
              type: "file" as const,
              data: new URL(photo.fileUri),
              mediaType: photo.contentType,
            })),
            { type: "text", text: buildIssueDiagnosisPrompt(issue) },
          ],
        },
      ],
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "issue-diagnosis" },
    });
    return output;
  }
}

const issueDiagnosisService = new IssueDiagnosisService();
export default issueDiagnosisService;
