import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

class DocumentRepository {
  create(
    data: Prisma.DocumentUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.document.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.document.findUnique({ where: { id } });
  }

  listUnreviewedByUnitId(
    unitId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.document.findMany({
      where: { unitId, reviewedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  countByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.document.count({ where: { unitId } });
  }

  update(
    id: string,
    data: Prisma.DocumentUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.document.update({ where: { id }, data });
  }

  delete(id: string, db: Prisma.TransactionClient = prisma) {
    return db.document.delete({ where: { id } });
  }
}

const documentRepository = new DocumentRepository();
export default documentRepository;
