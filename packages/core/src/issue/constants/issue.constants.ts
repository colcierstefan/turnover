import type {
  EmergencyType,
  IssueCategory,
  IssueStatus,
  ReporterLanguage,
  ReporterRole,
} from "@turnover/db/enums";

export type {
  EmergencyType,
  IssueCategory,
  IssueStatus,
  ReporterLanguage,
  ReporterRole,
};

export const MAX_REPORT_PHOTOS = 3;
export const MAX_REPORT_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_REPORTS_PER_UNIT_PER_HOUR = 10;
export const MAX_FOLLOW_UP_QUESTIONS = 2;
export const MAX_SELF_HELP_TIPS = 4;
export const REPORT_PHOTO_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;
export const EMERGENCY_PHONE_NUMBER = "112";
export const WARRANTY_STATUSES = [
  "UNDER_WARRANTY",
  "EXPIRED",
  "UNKNOWN",
] as const;
export type WarrantyStatus = (typeof WARRANTY_STATUSES)[number];
