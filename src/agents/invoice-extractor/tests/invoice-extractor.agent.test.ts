import { ThinkingLevel } from "@google/genai";
import { describe, expect, it, vi } from "vitest";

import { extractInvoice } from "@/agents/invoice-extractor/invoice-extractor.agent";
import { generateStructured } from "@/utils/model.utils";

vi.mock("@/utils/model.utils", () => ({ generateStructured: vi.fn() }));

describe("extractInvoice", () => {
  it("sends the stored PDF by its gs URI with minimal thinking", async () => {
    vi.mocked(generateStructured).mockResolvedValue({
      data: { shopName: null, purchaseDate: null, items: [] },
    } as never);

    await extractInvoice({
      fileUri: "gs://bucket/units/u/documents/d",
      contentType: "application/pdf",
    });

    const call = vi.mocked(generateStructured).mock.calls[0][0];
    expect(call.contents).toEqual([
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: "gs://bucket/units/u/documents/d",
              mimeType: "application/pdf",
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
