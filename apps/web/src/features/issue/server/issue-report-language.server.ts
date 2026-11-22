import "server-only";

import { cookies, headers } from "next/headers";

import type { ReporterLanguage } from "@turnover/core/issue/constants/issue.constants";

export const REPORTER_LANGUAGE_COOKIE = "reporter-language";

export const getReporterLanguage = async (): Promise<ReporterLanguage> => {
  const chosen = (await cookies()).get(REPORTER_LANGUAGE_COOKIE)?.value;
  if (chosen === "EN" || chosen === "RO") return chosen;
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  return acceptLanguage.trim().toLowerCase().startsWith("ro") ? "RO" : "EN";
};
