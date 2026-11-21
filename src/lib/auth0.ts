import "server-only";

import { Auth0Client } from "@auth0/nextjs-auth0/server";

import env from "@/config/env.config";

const auth0 = new Auth0Client({
  domain: env.auth0.domain,
  clientId: env.auth0.clientId,
  clientSecret: env.auth0.clientSecret,
  secret: env.auth0.secret,
  appBaseUrl: env.auth0.appBaseUrl,
});

export default auth0;
