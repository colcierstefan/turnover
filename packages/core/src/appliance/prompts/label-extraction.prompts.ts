export const buildLabelExtractionPrompt = () =>
  `You read the rating plate (type label) of a household appliance from a photo.

Return the appliance kind, brand, model, serial number and production date.

Rules:
- Only report text you can actually read in this photo. If the photo shows no rating plate, or its text is too blurry to read, return null for brand, model, serial number and production date, and OTHER as the kind. Never fill a field from what such an appliance or label usually contains.
- Copy values exactly as printed. Do not correct, complete or translate them.
- If a field is not on the label, cut off, covered or too blurry to read with certainty, return null for it. Never guess. An empty field is better than a wrong one.
- The serial number is only a value labelled as one (S/N, SN, Ser. No., Serial No., Seriennummer, Nr. serie, Серийный номер). Barcode digits, FD, Z-Nr, product, index or service numbers are not serial numbers. If no value is labelled as a serial number, serialNumber is null.
- The production date counts only when it is printed as a date (for example "Prod. date 06/2019" or "2019.06.14"). Do not decode dates from serial numbers, FD numbers or other codes.
- Decide the kind from what the label states (product type, energy class text, refrigerant, wash capacity, heating power) and from the model. Use OTHER when it is unclear.`;
