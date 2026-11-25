import { z } from "zod";

import {
  MANAGER_ISSUE_RESOLUTIONS,
  MAX_FOLLOW_UP_QUESTIONS,
  MAX_REPORT_PHOTO_BYTES,
  MAX_REPORT_PHOTOS,
  REPORT_PHOTO_CONTENT_TYPES,
} from "@turnover/core/issue/constants/issue.constants";
import { ReporterLanguage } from "@turnover/db/enums";

const reportPhotoSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_REPORT_PHOTO_BYTES)
  .refine((file) =>
    (REPORT_PHOTO_CONTENT_TYPES as ReadonlyArray<string>).includes(file.type),
  );

export const reporterLanguageSchema = z.enum(ReporterLanguage);

const reportTokenSchema = z.string().min(1);

export const submitIssueReportInputSchema = z.object({
  reportToken: reportTokenSchema,
  reporterRole: z.enum(["GUEST", "CLEANER"]),
  reporterName: z
    .string()
    .trim()
    .max(100)
    .transform((name) => name || null),
  reporterLanguage: reporterLanguageSchema,
  description: z.string().trim().min(1).max(2000),
  photos: z.array(reportPhotoSchema).max(MAX_REPORT_PHOTOS),
});
export type SubmitIssueReportInput = z.infer<
  typeof submitIssueReportInputSchema
>;

export const answerIssueFollowUpsInputSchema = z.object({
  reportToken: reportTokenSchema,
  issueId: z.uuid(),
  answers: z
    .array(
      z.object({
        followUpId: z.uuid(),
        answer: z.string().trim().max(1000),
      }),
    )
    .min(1)
    .max(MAX_FOLLOW_UP_QUESTIONS),
});
export type AnswerIssueFollowUpsInput = z.infer<
  typeof answerIssueFollowUpsInputSchema
>;

export const reportedIssueInputSchema = z.object({
  reportToken: reportTokenSchema,
  issueId: z.uuid(),
});
export type ReportedIssueInput = z.infer<typeof reportedIssueInputSchema>;

export const reportIssueAsManagerInputSchema = z.object({
  unitId: z.uuid(),
  description: z.string().trim().min(1).max(2000),
  applianceId: z
    .union([z.uuid(), z.literal("")])
    .transform((applianceId) => applianceId || null),
  photos: z.array(reportPhotoSchema).max(MAX_REPORT_PHOTOS),
});
export type ReportIssueAsManagerInput = z.infer<
  typeof reportIssueAsManagerInputSchema
>;

export const issueIdInputSchema = z.object({ issueId: z.uuid() });

export const changeIssueApplianceInputSchema = z.object({
  issueId: z.uuid(),
  applianceId: z.uuid().nullable(),
});
export type ChangeIssueApplianceInput = z.infer<
  typeof changeIssueApplianceInputSchema
>;

export const scheduleIssueVisitInputSchema = z.object({
  issueId: z.uuid(),
  scheduledFor: z.iso.date(),
  scheduledTime: z
    .union([z.literal(""), z.iso.time({ precision: -1 })])
    .transform((time) => time || null),
});
export type ScheduleIssueVisitInput = z.infer<
  typeof scheduleIssueVisitInputSchema
>;

export const closeIssueInputSchema = z.object({
  issueId: z.uuid(),
  resolution: z.enum(MANAGER_ISSUE_RESOLUTIONS),
  costRon: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe(z.number().nonnegative().max(1_000_000).nullable()),
  costNote: z
    .string()
    .trim()
    .max(1000)
    .transform((note) => note || null),
  resolvedByHandymanId: z
    .union([z.uuid(), z.literal("")])
    .transform((handymanId) => handymanId || null),
  retireAppliance: z.stringbool().default(false),
});
export type CloseIssueInput = z.infer<typeof closeIssueInputSchema>;
