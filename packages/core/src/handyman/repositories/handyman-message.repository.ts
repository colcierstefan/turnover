import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class HandymanMessageRepository {
  create(
    data: Prisma.HandymanMessageUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.handymanMessage.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.handymanMessage.findUnique({ where: { id } });
  }

  listByIssueId(issueId: string, db: Prisma.TransactionClient = prisma) {
    return db.handymanMessage.findMany({
      where: { issueId },
      orderBy: { openedInWhatsAppAt: "desc" },
    });
  }

  countByIssueId(issueId: string, db: Prisma.TransactionClient = prisma) {
    return db.handymanMessage.count({ where: { issueId } });
  }

  update(
    id: string,
    data: Prisma.HandymanMessageUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.handymanMessage.update({ where: { id }, data });
  }
}

const handymanMessageRepository = new HandymanMessageRepository();
export default handymanMessageRepository;
