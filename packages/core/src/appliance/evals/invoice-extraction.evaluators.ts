import type { InvoiceExpected } from "@turnover/core/appliance/evals/invoice-extraction.dataset";
import type { InvoiceExtractionOutput } from "@turnover/core/appliance/schemas/invoice-extraction.schema";
import { isSameText, matchesExpected } from "@turnover/core/utils/eval.utils";

const PRICE_TOLERANCE_RON = 0.01;

export const scoreInvoiceExtraction = (
  expected: InvoiceExpected,
  actual: InvoiceExtractionOutput,
) => ({
  invoice: {
    shopName: matchesExpected(expected.shopName, actual.shopName, isSameText),
    purchaseDate: expected.purchaseDate === actual.purchaseDate,
    itemCount: expected.items.length === actual.items.length,
  },
  items: expected.items.map((expectedItem, index) => {
    const actualItem = actual.items.at(index);
    return {
      "item.category": actualItem?.category === expectedItem.category,
      "item.brand":
        !!actualItem &&
        matchesExpected(expectedItem.brand, actualItem.brand, isSameText),
      "item.model":
        !!actualItem &&
        matchesExpected(expectedItem.model, actualItem.model, isSameText),
      "item.quantity": actualItem?.quantity === expectedItem.quantity,
      "item.unitPriceRon":
        !!actualItem &&
        matchesExpected(
          expectedItem.unitPriceRon,
          actualItem.unitPriceRon,
          (left, right) => Math.abs(left - right) <= PRICE_TOLERANCE_RON,
        ),
      "item.warrantyMonths":
        !!actualItem &&
        actualItem.warrantyMonths === expectedItem.warrantyMonths,
    };
  }),
});
