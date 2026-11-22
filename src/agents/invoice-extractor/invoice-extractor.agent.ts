import "server-only";

import { ThinkingLevel } from "@google/genai";

import { buildInvoiceExtractorPrompt } from "@/agents/invoice-extractor/prompts/invoice-extractor.prompts";
import {
  invoiceExtractorOutputSchema,
  type InvoiceExtractorInput,
} from "@/agents/invoice-extractor/schemas/invoice-extractor.schema";
import { generateStructured } from "@/utils/model.utils";

export async function extractInvoice(input: InvoiceExtractorInput) {
  const { data } = await generateStructured({
    name: "invoice-extractor",
    schema: invoiceExtractorOutputSchema,
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { fileUri: input.fileUri, mimeType: input.contentType } },
          { text: buildInvoiceExtractorPrompt() },
        ],
      },
    ],
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
  });
  return data;
}
