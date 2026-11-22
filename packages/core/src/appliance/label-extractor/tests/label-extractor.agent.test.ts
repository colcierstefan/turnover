import { ThinkingLevel } from "@google/genai";
import { describe, expect, it, vi } from "vitest";

import { extractLabel } from "@turnover/core/appliance/label-extractor/label-extractor.agent";
import { generateStructured } from "@turnover/core/utils/model.utils";

vi.mock("@turnover/core/utils/model.utils", () => ({
  generateStructured: vi.fn(),
}));

describe("extractLabel", () => {
  it("sends the stored file by its gs URI with minimal thinking", async () => {
    vi.mocked(generateStructured).mockResolvedValue({
      data: { category: "OTHER" },
    } as never);

    await extractLabel({
      fileUri: "gs://bucket/units/u/documents/d",
      contentType: "image/jpeg",
    });

    const call = vi.mocked(generateStructured).mock.calls[0][0];
    expect(call.contents).toEqual([
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: "gs://bucket/units/u/documents/d",
              mimeType: "image/jpeg",
            },
          },
          { text: expect.any(String) },
        ],
      },
    ]);
    expect(call.config?.thinkingConfig?.thinkingLevel).toBe(
      ThinkingLevel.MINIMAL,
    );
  });
});
