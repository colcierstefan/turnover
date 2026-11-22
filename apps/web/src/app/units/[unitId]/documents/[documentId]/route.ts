import { Readable } from "node:stream";

import documentService from "@turnover/core/appliance/services/document.service";
import { ForbiddenError, NotFoundError } from "@turnover/core/lib/errors";
import userService from "@turnover/core/user/services/user.service";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/units/[unitId]/documents/[documentId]">,
) {
  const { documentId } = await params;
  const user = await userService.getCurrentUser();
  if (!user) return new Response(null, { status: 401 });

  try {
    const file = await documentService.getDocumentFile(user.id, documentId);
    return new Response(Readable.toWeb(file.stream) as ReadableStream, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      return new Response(null, { status: 404 });
    }
    throw error;
  }
}
