export const buildInvoiceExtractorPrompt = () =>
  `You read a purchase invoice from a Romanian shop (photo or PDF) and list the household appliances bought on it.

Return the shop, the invoice date and one item per appliance line.

Rules:
- Only appliances are items. Delivery, transport, installation, packaging, environmental stamp (timbru verde), extended warranty and service lines are not items.
- An extended warranty line (for example "Garantie extinsa +3 ani") adds its months to the warranty of the appliance it covers. The appliance's own warranty counts only when the invoice states it (for example "Garantie 24 luni" or a warranty column). If the invoice states no warranty for an appliance, warrantyMonths is null. Never assume a legal or default warranty.
- unitPriceRon is the price of one piece including VAT (TVA). If the invoice lists prices without VAT and the VAT separately, add the line's VAT to its value without VAT and divide by the quantity.
- Copy brand and model exactly as printed. If a value is not on the invoice or cannot be read with certainty, return null. Never guess.`;
