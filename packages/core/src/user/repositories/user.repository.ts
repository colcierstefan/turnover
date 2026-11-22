import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class UserRepository {
  upsertByAuth0Id(
    data: Prisma.UserCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.upsert({
      where: { auth0Id: data.auth0Id },
      create: data,
      update: data,
    });
  }
}

const userRepository = new UserRepository();
export default userRepository;
