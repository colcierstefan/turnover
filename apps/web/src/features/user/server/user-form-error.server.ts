import "server-only";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export const getFormErrorMessage = (
  language: UserLanguage,
  error: Readonly<{
    issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey> }>;
  }>,
) => {
  const text = MANAGER_TEXT[language];
  const field = error.issues[0].path.findLast(
    (segment): segment is keyof typeof text.formErrors =>
      typeof segment === "string" && segment in text.formErrors,
  );
  return field ? text.formErrors[field] : text.formInvalid;
};
