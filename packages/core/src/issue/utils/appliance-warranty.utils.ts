import type { WarrantyStatus } from "@turnover/core/issue/constants/issue.constants";
import { toIsoDate } from "@turnover/core/utils/date.utils";

export const getWarrantyStatus = (
  warrantyUntil: Date | null,
  today: Date,
): WarrantyStatus => {
  if (!warrantyUntil) return "UNKNOWN";
  return toIsoDate(warrantyUntil) >= toIsoDate(today)
    ? "UNDER_WARRANTY"
    : "EXPIRED";
};
