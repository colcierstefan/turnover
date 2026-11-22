import "server-only";

import { generateText, Output } from "ai";

import { buildInvoiceExtractionPrompt } from "@turnover/core/appliance/prompts/invoice-extraction.prompts";
import {
  invoiceExtractionOutputSchema,
  type InvoiceExtractionInput,
} from "@turnover/core/appliance/schemas/invoice-extraction.schema";
import env from "@turnover/core/config/env.config";
import vertex from "@turnover/core/lib/vertex";

class InvoiceExtractionService {
  async extract(input: InvoiceExtractionInput) {
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({ schema: invoiceExtractionOutputSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: new URL(input.fileUri),
              mediaType: input.contentType,
            },
            { type: "text", text: buildInvoiceExtractionPrompt() },
          ],
        },
      ],
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
      telemetry: { functionId: "invoice-extraction" },
    });
    return output;
  }
}

const invoiceExtractionService = new InvoiceExtractionService();
export default invoiceExtractionService;
