import { ForbiddenError, NotFoundError } from "@turnover/core/lib/errors";

export const readInOrganization = async <Result>(
  read: () => Promise<Result>,
) => {
  try {
    return await read();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      return { error: "Not found in your organization." } as const;
    }
    throw error;
  }
};
