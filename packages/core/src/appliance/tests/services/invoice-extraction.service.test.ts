import { generateText } from "ai";
import { describe, expect, it, vi } from "vitest";

import invoiceExtractionService from "@turnover/core/appliance/services/invoice-extraction.service";

vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  generateText: vi.fn(),
}));
vi.mock("@turnover/core/config/env.config", () => ({
  default: { vertex: { modelId: "test-model" } },
}));
vi.mock("@turnover/core/lib/vertex", () => ({ default: vi.fn() }));

describe("invoiceExtractionService.extract", () => {
  it("sends the stored PDF by its gs URI with minimal thinking", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: { shopName: null, purchaseDate: null, items: [] },
    } as never);

    await invoiceExtractionService.extract({
      fileUri: "gs://bucket/units/u/documents/d",
      contentType: "application/pdf",
    });

    const call = vi.mocked(generateText).mock.calls[0][0];
    expect(call.messages).toEqual([
      {
        role: "user",
        content: [
          {
            type: "file",
            data: new URL("gs://bucket/units/u/documents/d"),
            mediaType: "application/pdf",
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
