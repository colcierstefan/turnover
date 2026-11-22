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
}

const issuePhotoRepository = new IssuePhotoRepository();
export default issuePhotoRepository;
