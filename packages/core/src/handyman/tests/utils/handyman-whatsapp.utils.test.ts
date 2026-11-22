import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl } from "@turnover/core/handyman/utils/handyman-whatsapp.utils";

describe("buildWhatsAppUrl", () => {
  it("opens the chat with the number and the encoded text", () => {
    expect(buildWhatsAppUrl("+40712345678", "Bună ziua, ați putea veni?")).toBe(
      "https://wa.me/40712345678?text=Bun%C4%83%20ziua%2C%20a%C8%9Bi%20putea%20veni%3F",
    );
  });

  it("lets the manager choose the chat when there is no number", () => {
    expect(buildWhatsAppUrl(null, "Salut")).toBe("https://wa.me/?text=Salut");
  });
});
