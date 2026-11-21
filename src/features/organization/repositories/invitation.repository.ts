import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

class InvitationRepository {
  create(
    data: Prisma.InvitationUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.invitation.create({ data });
  }

  findByToken(token: string, db: Prisma.TransactionClient = prisma) {
    return db.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });
  }

  listPendingByOrganizationId(
    organizationId: string,
    now: Date,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.invitation.findMany({
      where: { organizationId, acceptedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
    });
  }

  markAccepted(
    id: string,
    acceptedAt: Date,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.invitation.update({ where: { id }, data: { acceptedAt } });
  }
}

const invitationRepository = new InvitationRepository();
export default invitationRepository;
