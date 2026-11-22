import "server-only";

import { Storage } from "@google-cloud/storage";

import env from "@/config/env.config";

const storage = new Storage({ projectId: env.vertex.project });

export const bucket = storage.bucket(env.storage.bucket);
