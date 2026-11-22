import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class HandymanRepository {
  create(
    data: Prisma.HandymanUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.handyman.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.handyman.findUnique({ where: { id } });
  }

  findByOrganizationIdAndPhone(
    organizationId: string,
    phone: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.handyman.findUnique({
      where: { organizationId_phone: { organizationId, phone } },
    });
  }

  listByOrganizationId(
    organizationId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.handyman.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  }

  update(
    id: string,
    data: Prisma.HandymanUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.handyman.update({ where: { id }, data });
  }

  delete(id: string, db: Prisma.TransactionClient = prisma) {
    return db.handyman.delete({ where: { id } });
  }
}

const handymanRepository = new HandymanRepository();
export default handymanRepository;
