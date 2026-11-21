import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

class OrganizationRepository {
  create(
    data: Prisma.OrganizationCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.organization.create({ data });
  }
}

const organizationRepository = new OrganizationRepository();
export default organizationRepository;
