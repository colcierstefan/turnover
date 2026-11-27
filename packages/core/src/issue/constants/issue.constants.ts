import type {
  EmergencyType,
  IssueCategory,
  IssueResolution,
  IssueStatus,
  ReporterLanguage,
  ReporterRole,
} from "@turnover/db/enums";

export type {
  EmergencyType,
  IssueCategory,
  IssueResolution,
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
export const MANAGER_ISSUE_RESOLUTIONS = [
  "REPAIRED",
  "REPLACED",
  "FIXED_WITHOUT_HANDYMAN",
  "NOT_NEEDED",
] as const satisfies ReadonlyArray<IssueResolution>;
export const REPAIR_HISTORY_TIME_ZONE = "Europe/Bucharest";
export const ISSUE_SUMMARY_MIN_OPEN_ISSUES = 10;
export const ISSUE_SUMMARY_MAX_POINTS = 5;
export const ISSUE_SUMMARY_REPEAT_WINDOW_DAYS = 90;
export const ISSUE_SUMMARY_DESCRIPTION_MAX_LENGTH = 150;
export const ISSUE_SUMMARY_TIME_ZONE = "Europe/Bucharest";
export const ISSUE_QUERY_TIME_ZONE = "Europe/Bucharest";
export const REPAIR_COST_GROUPINGS = [
  "UNIT",
  "APPLIANCE",
  "HANDYMAN",
  "MONTH",
] as const;
export type RepairCostGrouping = (typeof REPAIR_COST_GROUPINGS)[number];
