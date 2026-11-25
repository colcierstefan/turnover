import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class ApplianceRepository {
  create(
    data: Prisma.ApplianceUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.appliance.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.appliance.findUnique({
      where: { id },
      include: { documents: { include: { document: true } } },
    });
  }

  listActiveByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.appliance.findMany({
      where: { unitId, retiredAt: null },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });
  }

  countByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.appliance.count({ where: { unitId } });
  }

  update(
    id: string,
    data: Prisma.ApplianceUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.appliance.update({ where: { id }, data });
  }

  delete(id: string, db: Prisma.TransactionClient = prisma) {
    return db.appliance.delete({ where: { id } });
  }
}

const applianceRepository = new ApplianceRepository();
export default applianceRepository;
