import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

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

  listByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.appliance.findMany({
      where: { unitId },
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
