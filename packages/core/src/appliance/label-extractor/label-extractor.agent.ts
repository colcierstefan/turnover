import "server-only";

import { ThinkingLevel } from "@google/genai";

import { buildLabelExtractorPrompt } from "@turnover/core/appliance/label-extractor/prompts/label-extractor.prompts";
import {
  labelExtractorOutputSchema,
  type LabelExtractorInput,
} from "@turnover/core/appliance/label-extractor/schemas/label-extractor.schema";
import { generateStructured } from "@turnover/core/utils/model.utils";

export async function extractLabel(input: LabelExtractorInput) {
  const { data } = await generateStructured({
    name: "label-extractor",
    schema: labelExtractorOutputSchema,
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { fileUri: input.fileUri, mimeType: input.contentType } },
          { text: buildLabelExtractorPrompt() },
        ],
      },
    ],
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
  });
  return data;
}
