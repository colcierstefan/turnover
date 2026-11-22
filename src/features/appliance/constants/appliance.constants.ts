import type { ApplianceCategory, DocumentKind } from "@/generated/prisma/enums";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const EMPTY_FIELD_CLASSES = "border-amber-500 bg-amber-500/10";

export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  FRIDGE: "Fridge",
  FREEZER: "Freezer",
  OVEN: "Oven",
  HOB: "Hob",
  MICROWAVE: "Microwave",
  DISHWASHER: "Dishwasher",
  WASHING_MACHINE: "Washing machine",
  DRYER: "Dryer",
  WASHER_DRYER: "Washer-dryer",
  AIR_CONDITIONER: "Air conditioner",
  WATER_HEATER: "Water heater",
  EXTRACTOR_HOOD: "Extractor hood",
  TV: "TV",
  COFFEE_MACHINE: "Coffee machine",
  OTHER: "Other",
};

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  LABEL_PHOTO: "Label photo",
  INVOICE: "Invoice",
  PHOTO: "Photo",
};
