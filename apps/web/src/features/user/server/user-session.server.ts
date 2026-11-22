import "server-only";

import { redirect } from "next/navigation";

import { ForbiddenError } from "@turnover/core/lib/errors";
import userService from "@turnover/core/user/services/user.service";

export const getSignedInUser = async (returnTo: string) => {
  const user = await userService.getCurrentUser();
  if (!user) redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (!user.language) {
    redirect(`/language?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return { ...user, language: user.language };
};

export const requireSignedInUser = async () => {
  const user = await userService.requireCurrentUser();
  if (!user.language)
    throw new ForbiddenError(`User ${user.id} has no language`);
  return { ...user, language: user.language };
};
