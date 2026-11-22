import { z } from "zod";

import {
  HANDYMAN_TRADES,
  REPORT_PHOTO_CONTENT_TYPES,
  WARRANTY_STATUSES,
} from "@turnover/core/issue/constants/issue.constants";
import {
  ApplianceCategory,
  EmergencyType,
  IssueCategory,
  ReporterRole,
  UserLanguage,
} from "@turnover/db/enums";

export const diagnosisApplianceSchema = z.object({
  id: z.string(),
  category: z.enum(ApplianceCategory),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  manufactureDate: z.string().nullable(),
  purchaseDate: z.iso.date().nullable(),
  warrantyUntil: z.iso.date().nullable(),
  warrantyStatus: z.enum(WARRANTY_STATUSES),
});
export type DiagnosisAppliance = z.infer<typeof diagnosisApplianceSchema>;

export const issueDiagnosisInputSchema = z.object({
  description: z.string().min(1),
  reporterRole: z.enum(ReporterRole),
  emergencyType: z.enum(EmergencyType).nullable(),
  followUps: z.array(
    z.object({ question: z.string(), answer: z.string().nullable() }),
  ),
  appliances: z.array(diagnosisApplianceSchema),
  confirmedApplianceId: z.string().nullable(),
  language: z.enum(UserLanguage),
  today: z.iso.date(),
  photos: z.array(
    z.object({
      fileUri: z.string().startsWith("gs://"),
      contentType: z.enum(REPORT_PHOTO_CONTENT_TYPES),
    }),
  ),
});
export type IssueDiagnosisInput = z.infer<typeof issueDiagnosisInputSchema>;

const costRangeSchema = z.object({
  minRon: z.number().int().nonnegative(),
  maxRon: z.number().int().nonnegative(),
});
export type CostRange = z.infer<typeof costRangeSchema>;

export const issueDiagnosisResultSchema = z.object({
  category: z
    .enum(IssueCategory)
    .describe(
      "SELF_FIX: the manager or a guest can solve it without a handyman or a new part. PART: a part must be bought and fitted, with no other work on the appliance or installation. REPAIR: a handyman must repair it. REPLACE: the appliance or fixture should be replaced because a repair is impossible or would cost more than half of a comparable new one.",
    ),
  likelyCause: z
    .string()
    .describe(
      "The most likely cause in one or two short sentences, in the requested language.",
    ),
  nextSteps: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe(
      "What the manager should do next, most important first, each one short sentence in the requested language.",
    ),
  trade: z
    .enum(HANDYMAN_TRADES)
    .nullable()
    .describe("The trade that should do the work, or null for SELF_FIX."),
  partCostRon: costRangeSchema
    .nullable()
    .describe(
      "Price range in RON of the part to buy, or null when no part is needed.",
    ),
  labourCostRon: costRangeSchema
    .nullable()
    .describe(
      "Price range in RON of the handyman's labour, including the call-out, or null when no handyman is needed.",
    ),
  newApplianceCostRon: costRangeSchema
    .nullable()
    .describe(
      "Price range in RON of a comparable new appliance, or null when the issue is not about an appliance.",
    ),
});
export type IssueDiagnosisResult = z.infer<typeof issueDiagnosisResultSchema>;

export const storedIssueDiagnosisSchema = issueDiagnosisResultSchema.omit({
  category: true,
});
export type StoredIssueDiagnosis = z.infer<typeof storedIssueDiagnosisSchema>;

export const buildIssueDiagnosisOutputSchema = (
  applianceIds: ReadonlyArray<string>,
) =>
  issueDiagnosisResultSchema.extend({
    applianceId: (applianceIds.length > 0
      ? z.enum(applianceIds as [string, ...string[]]).nullable()
      : z.null()
    ).describe(
      "The id of the appliance in this apartment the issue is about, or null when it is about none of them.",
    ),
  });
export type IssueDiagnosisOutput = z.infer<
  ReturnType<typeof buildIssueDiagnosisOutputSchema>
>;
