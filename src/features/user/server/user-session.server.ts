import "server-only";

import { redirect } from "next/navigation";

import userService from "@/features/user/services/user.service";

export const getSignedInUser = async (returnTo: string) => {
  const user = await userService.getCurrentUser();
  if (!user) redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  return user;
};
