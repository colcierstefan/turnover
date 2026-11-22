import { z } from "zod";

import {
  MAX_FOLLOW_UP_QUESTIONS,
  REPORT_PHOTO_CONTENT_TYPES,
} from "@turnover/core/issue/constants/issue.constants";
import {
  ApplianceCategory,
  EmergencyType,
  ReporterLanguage,
  ReporterRole,
} from "@turnover/db/enums";

export const unitApplianceSchema = z.object({
  category: z.enum(ApplianceCategory),
  brand: z.string().nullable(),
  model: z.string().nullable(),
});
export type UnitAppliance = z.infer<typeof unitApplianceSchema>;

export const reportTriageInputSchema = z.object({
  description: z.string().min(1),
  reporterRole: z.enum(ReporterRole),
  reporterLanguage: z.enum(ReporterLanguage),
  appliances: z.array(unitApplianceSchema),
  photos: z.array(
    z.object({
      fileUri: z.string().startsWith("gs://"),
      contentType: z.enum(REPORT_PHOTO_CONTENT_TYPES),
    }),
  ),
});
export type ReportTriageInput = z.infer<typeof reportTriageInputSchema>;

export const reportTriageOutputSchema = z.object({
  emergencyType: z
    .enum(EmergencyType)
    .nullable()
    .describe(
      "The emergency the report describes, or null when it is not one of these emergencies.",
    ),
  questions: z
    .array(z.string())
    .max(MAX_FOLLOW_UP_QUESTIONS)
    .describe(
      "Follow-up questions for the reporter, in the reporter's language. Empty for an emergency or when the report is already clear.",
    ),
});
export type ReportTriageOutput = z.infer<typeof reportTriageOutputSchema>;
