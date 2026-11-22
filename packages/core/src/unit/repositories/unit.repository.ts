import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class UnitRepository {
  create(
    data: Prisma.UnitUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.unit.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.unit.findUnique({ where: { id } });
  }

  findByReportToken(
    reportToken: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.unit.findUnique({ where: { reportToken } });
  }

  listByOrganizationId(
    organizationId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.unit.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  }

  update(
    id: string,
    data: Prisma.UnitUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.unit.update({ where: { id }, data });
  }

  delete(id: string, db: Prisma.TransactionClient = prisma) {
    return db.unit.delete({ where: { id } });
  }
}

const unitRepository = new UnitRepository();
export default unitRepository;
