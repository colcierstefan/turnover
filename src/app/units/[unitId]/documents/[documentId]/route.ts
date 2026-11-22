import { Readable } from "node:stream";

import documentService from "@/features/appliance/services/document.service";
import userService from "@/features/user/services/user.service";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

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
