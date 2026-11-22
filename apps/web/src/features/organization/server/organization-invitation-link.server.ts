import "server-only";

import env from "@turnover/core/config/env.config";

export const getInvitationUrl = (token: string) =>
  `${env.app.baseUrl}/invitations/${token}`;
