import { Suspense } from "react";
import Link from "next/link";

import documentService from "@turnover/core/appliance/services/document.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import DocumentDiscardButton from "@/features/appliance/components/document/document-discard-button";
import DocumentReviewForm from "@/features/appliance/components/document/document-review-form";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function DocumentReviewPage({
  params,
}: PageProps<"/units/[unitId]/documents/[documentId]/review">) {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <DocumentReview params={params} />
    </Suspense>
  );
}

async function DocumentReview({
  params,
}: Readonly<{
  params: PageProps<"/units/[unitId]/documents/[documentId]/review">["params"];
}>) {
  const { unitId, documentId } = await params;
  const { user } = await getSignedInMembership(
    `/units/${unitId}/documents/${documentId}/review`,
  );
  const review = await documentService.getDocumentReview(user.id, documentId);
  const { document } = review;
  const fileUrl = `/units/${document.unitId}/documents/${document.id}`;
  const isInvoice = document.kind === "INVOICE";
  const text = MANAGER_TEXT[user.language];

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Link href={`/units/${document.unitId}`} className="text-sm opacity-70">
          {text.backToUnit}
        </Link>
        <h1 className="text-2xl font-semibold">
          {isInvoice
            ? text.documentReview.titleInvoice
            : text.documentReview.titleLabel}
        </h1>
        {document.contentType.startsWith("image/") ? (
          <a href={fileUrl} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- private file streamed by our own route */}
            <img
              src={fileUrl}
              alt={text.documentReview.uploadedFileAlt}
              className="max-h-64 w-full rounded object-contain"
            />
          </a>
        ) : (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {text.documentReview.openFile}
          </a>
        )}
        {document.reviewedAt ? (
          <p>{text.documentReview.alreadyReviewed}</p>
        ) : (
          <>
            {review.isExtracted ? (
              <p className="text-sm opacity-70">
                {text.documentReview.checkFields}
              </p>
            ) : (
              <p className="text-sm text-amber-600">
                {text.documentReview.couldNotRead}
              </p>
            )}
            {isInvoice && (review.shopName || review.purchaseDate) && (
              <Card>
                <p className="text-sm">
                  {[review.shopName, review.purchaseDate]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </Card>
            )}
            <DocumentReviewForm
              documentId={document.id}
              rows={review.rows}
              canSkipRows={isInvoice}
              language={user.language}
            />
            <DocumentDiscardButton
              documentId={document.id}
              language={user.language}
            />
          </>
        )}
      </main>
    </>
  );
}
