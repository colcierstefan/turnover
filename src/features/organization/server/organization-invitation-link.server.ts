import "server-only";

import env from "@/config/env.config";

export const getInvitationUrl = (token: string) =>
  `${env.app.baseUrl}/invitations/${token}`;
