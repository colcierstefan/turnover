import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

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
