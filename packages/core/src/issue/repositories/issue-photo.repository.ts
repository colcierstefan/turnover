import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class IssuePhotoRepository {
  create(
    data: Prisma.IssuePhotoUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issuePhoto.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.issuePhoto.findUnique({ where: { id } });
  }

  listByIssueId(issueId: string, db: Prisma.TransactionClient = prisma) {
    return db.issuePhoto.findMany({
      where: { issueId },
      orderBy: { createdAt: "asc" },
    });
  }
}

const issuePhotoRepository = new IssuePhotoRepository();
export default issuePhotoRepository;
