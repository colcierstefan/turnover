import "server-only";

import { redirect } from "next/navigation";

import organizationService from "@turnover/core/organization/services/organization.service";

import { getSignedInUser } from "@/features/user/server/user-session.server";

export const getSignedInMembership = async (returnTo: string) => {
  const user = await getSignedInUser(returnTo);
  const membership = await organizationService.getMembershipForUser(user.id);
  if (!membership) redirect("/");
  return { user, membership };
};
