import Link from "next/link";

import DocumentDiscardButton from "@/features/appliance/components/document/document-discard-button";
import { DOCUMENT_KIND_LABELS } from "@/features/appliance/constants/appliance.constants";
import type { DocumentKind } from "@/generated/prisma/enums";

export default function DocumentUnreviewedList({
  unitId,
  documents,
}: Readonly<{
  unitId: string;
  documents: ReadonlyArray<{ id: string; kind: DocumentKind; createdAt: Date }>;
}>) {
  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {documents.map((document) => (
        <li
          key={document.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium">{DOCUMENT_KIND_LABELS[document.kind]}</p>
            <p className="text-sm opacity-70">
              Uploaded {document.createdAt.toLocaleDateString("en-GB")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/units/${unitId}/documents/${document.id}/review`}
              className="rounded bg-foreground px-4 py-2 font-medium text-background"
            >
              Review
            </Link>
            <DocumentDiscardButton documentId={document.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
