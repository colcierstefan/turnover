import Link from "next/link";

import type { DocumentKind } from "@turnover/core/appliance/constants/appliance.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import DocumentDiscardButton from "@/features/appliance/components/document/document-discard-button";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function DocumentUnreviewedList({
  unitId,
  documents,
  language,
}: Readonly<{
  unitId: string;
  documents: ReadonlyArray<{ id: string; kind: DocumentKind; createdAt: Date }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const dateFormat = new Intl.DateTimeFormat(text.locale);

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {documents.map((document) => (
        <li
          key={document.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium">
              {text.appliance.documentKinds[document.kind]}
            </p>
            <p className="text-sm opacity-70">
              {text.documentReview.uploadedOn(
                dateFormat.format(document.createdAt),
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/units/${unitId}/documents/${document.id}/review`}
              className="rounded bg-foreground px-4 py-2 font-medium text-background"
            >
              {text.documentReview.review}
            </Link>
            <DocumentDiscardButton
              documentId={document.id}
              language={language}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
