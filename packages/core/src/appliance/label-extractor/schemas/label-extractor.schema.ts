import { z } from "zod";

import { PARTIAL_ISO_DATE_PATTERN } from "@turnover/core/utils/date.utils";
import { ApplianceCategory } from "@turnover/db/enums";

export const labelExtractorInputSchema = z.object({
  fileUri: z.string().startsWith("gs://"),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]),
});
export type LabelExtractorInput = z.infer<typeof labelExtractorInputSchema>;

export const labelExtractorOutputSchema = z.object({
  category: z
    .enum(ApplianceCategory)
    .describe(
      "Kind of appliance. OTHER when the photo does not show which of the listed kinds it is.",
    ),
  brand: z
    .string()
    .nullable()
    .describe(
      "Manufacturer brand as printed on this label, e.g. Bosch, Samsung, Arctic. Null when not readable in the photo.",
    ),
  model: z
    .string()
    .nullable()
    .describe(
      "Model or type designation exactly as printed, including any suffix after a slash, e.g. WAN28262BY/01. For Bosch, Siemens and Neff this is the E-Nr.",
    ),
  serialNumber: z
    .string()
    .nullable()
    .describe("Serial number (S/N, SN, Ser. No.) exactly as printed."),
  manufactureDate: z
    .string()
    .regex(PARTIAL_ISO_DATE_PATTERN)
    .nullable()
    .describe(
      'Production date only when printed as a date: "YYYY", "YYYY-MM" or "YYYY-MM-DD", with only the parts that are printed. Null when no date is printed, including when it is only encoded in a serial or FD number.',
    ),
});
export type LabelExtractorOutput = z.infer<typeof labelExtractorOutputSchema>;
