import { generateText } from "ai";
import { describe, expect, it, vi } from "vitest";

import labelExtractionService from "@turnover/core/appliance/services/label-extraction.service";

vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  generateText: vi.fn(),
}));
vi.mock("@turnover/core/config/env.config", () => ({
  default: { vertex: { modelId: "test-model" } },
}));
vi.mock("@turnover/core/lib/vertex", () => ({ default: vi.fn() }));

describe("labelExtractionService.extract", () => {
  it("sends the stored file by its gs URI with minimal thinking", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: { category: "OTHER" },
    } as never);

    await labelExtractionService.extract({
      fileUri: "gs://bucket/units/u/documents/d",
      contentType: "image/jpeg",
    });

    const call = vi.mocked(generateText).mock.calls[0][0];
    expect(call.messages).toEqual([
      {
        role: "user",
        content: [
          {
            type: "file",
            data: new URL("gs://bucket/units/u/documents/d"),
            mediaType: "image/jpeg",
          },
          { type: "text", text: expect.any(String) },
        ],
      },
    ]);
    expect(call.providerOptions).toEqual({
      vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
    });
  });
});
