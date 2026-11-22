import { describe, expect, it } from "vitest";

import {
  addMonthsToIsoDate,
  buildDocumentReview,
} from "@/features/appliance/utils/document-review.utils";

const invoiceItem = {
  description: "Masina de spalat Bosch WAN28262BY",
  category: "WASHING_MACHINE" as const,
  brand: "Bosch",
  model: "WAN28262BY",
  quantity: 2,
  unitPriceRon: 2199.99,
  warrantyMonths: 60,
};

describe("addMonthsToIsoDate", () => {
  it("adds months and keeps the day", () => {
    expect(addMonthsToIsoDate("2024-03-15", 24)).toBe("2026-03-15");
  });

  it("clamps to the last day of a shorter month", () => {
    expect(addMonthsToIsoDate("2024-01-31", 1)).toBe("2024-02-29");
  });
});

describe("buildDocumentReview", () => {
  it("prefills an invoice row with price, quantity and warranty end from the stated months", () => {
    const review = buildDocumentReview({
      kind: "INVOICE",
      extractedData: {
        shopName: "Altex",
        purchaseDate: "2024-03-15",
        items: [invoiceItem],
      },
    });

    expect(review.shopName).toBe("Altex");
    expect(review.rows).toHaveLength(1);
    expect(review.rows[0].quantity).toBe(2);
    expect(review.rows[0].values).toMatchObject({
      category: "WASHING_MACHINE",
      purchaseDate: "2024-03-15",
      purchasePriceRon: "2199.99",
      warrantyUntil: "2029-03-15",
    });
  });

  it("leaves the warranty empty when the invoice states none", () => {
    const review = buildDocumentReview({
      kind: "INVOICE",
      extractedData: {
        shopName: null,
        purchaseDate: "2024-03-15",
        items: [{ ...invoiceItem, warrantyMonths: null }],
      },
    });

    expect(review.rows[0].values.warrantyUntil).toBe("");
  });

  it("gives one empty row when extraction failed", () => {
    const review = buildDocumentReview({
      kind: "LABEL_PHOTO",
      extractedData: null,
    });

    expect(review.isExtracted).toBe(false);
    expect(review.rows).toHaveLength(1);
    expect(
      Object.values(review.rows[0].values).every((value) => value === ""),
    ).toBe(true);
  });
});
