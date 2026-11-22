import "server-only";

import { generateText, Output } from "ai";

import env from "@turnover/core/config/env.config";
import { buildReportTriagePrompt } from "@turnover/core/issue/prompts/report-triage.prompts";
import {
  reportTriageOutputSchema,
  type ReportTriageInput,
} from "@turnover/core/issue/schemas/report-triage.schema";
import vertex from "@turnover/core/lib/vertex";

class ReportTriageService {
  async triage(input: ReportTriageInput) {
    const { photos, ...report } = input;
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({ schema: reportTriageOutputSchema }),
      messages: [
        {
          role: "user",
          content: [
            ...photos.map((photo) => ({
              type: "file" as const,
              data: new URL(photo.fileUri),
              mediaType: photo.contentType,
            })),
            { type: "text", text: buildReportTriagePrompt(report) },
          ],
        },
      ],
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "report-triage" },
    });
    return output;
  }
}

const reportTriageService = new ReportTriageService();
export default reportTriageService;
