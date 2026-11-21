import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import env from "@/config/env.config";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reused across hot reloads in dev so each reload doesn't open a new pool.
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.database.url }),
  });

if (env.nodeEnv !== "production") globalForPrisma.prisma = prisma;

export default prisma;
