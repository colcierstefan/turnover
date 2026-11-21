import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

class MembershipRepository {
  findByUserId(userId: string, db: Prisma.TransactionClient = prisma) {
    return db.membership.findUnique({
      where: { userId },
      include: { organization: true },
    });
  }

  findByOrganizationIdAndEmail(
    organizationId: string,
    email: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.membership.findFirst({
      where: {
        organizationId,
        user: { email: { equals: email, mode: "insensitive" } },
      },
    });
  }

  listByOrganizationId(
    organizationId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.membership.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
  }

  create(
    data: Prisma.MembershipUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.membership.create({ data });
  }

  delete(
    organizationId: string,
    userId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.membership.delete({
      where: { organizationId_userId: { organizationId, userId } },
    });
  }
}

const membershipRepository = new MembershipRepository();
export default membershipRepository;
