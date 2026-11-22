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

  update(
    id: string,
    data: Prisma.UserUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.update({ where: { id }, data });
  }
}

const userRepository = new UserRepository();
export default userRepository;
