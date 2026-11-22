import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.url(),

  AUTH0_DOMAIN: z.string().min(1),
  AUTH0_CLIENT_ID: z.string().min(1),
  AUTH0_CLIENT_SECRET: z.string().min(1),
  AUTH0_SECRET: z.string().min(1),
  APP_BASE_URL: z.url(),

  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  GOOGLE_CLOUD_LOCATION: z.string().min(1),
  GEMINI_MODEL_ID: z.string().min(1),
  GOOGLE_CLOUD_STORAGE_BUCKET: z.string().min(1),

  LANGFUSE_PUBLIC_KEY: z.string().min(1),
  LANGFUSE_SECRET_KEY: z.string().min(1),
  LANGFUSE_BASE_URL: z.url(),
});

const variables = envSchema.parse(process.env);

const env = {
  nodeEnv: variables.NODE_ENV,
  app: {
    baseUrl: variables.APP_BASE_URL,
  },
  database: {
    url: variables.DATABASE_URL,
  },
  auth0: {
    domain: variables.AUTH0_DOMAIN,
    clientId: variables.AUTH0_CLIENT_ID,
    clientSecret: variables.AUTH0_CLIENT_SECRET,
    secret: variables.AUTH0_SECRET,
  },
  vertex: {
    project: variables.GOOGLE_CLOUD_PROJECT,
    location: variables.GOOGLE_CLOUD_LOCATION,
    modelId: variables.GEMINI_MODEL_ID,
  },
  storage: {
    bucket: variables.GOOGLE_CLOUD_STORAGE_BUCKET,
  },
  langfuse: {
    publicKey: variables.LANGFUSE_PUBLIC_KEY,
    secretKey: variables.LANGFUSE_SECRET_KEY,
    baseUrl: variables.LANGFUSE_BASE_URL,
  },
};

export default env;
