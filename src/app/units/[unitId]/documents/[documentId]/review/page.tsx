import { Suspense } from "react";
import Link from "next/link";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import DocumentDiscardButton from "@/features/appliance/components/document/document-discard-button";
import DocumentReviewForm from "@/features/appliance/components/document/document-review-form";
import documentService from "@/features/appliance/services/document.service";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";

export default function DocumentReviewPage({
  params,
}: PageProps<"/units/[unitId]/documents/[documentId]/review">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<p>Loading…</p>}>
          <DocumentReview params={params} />
        </Suspense>
      </main>
    </>
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

  return (
    <>
      <Link href={`/units/${document.unitId}`} className="text-sm opacity-70">
        ← Back to unit
      </Link>
      <h1 className="text-2xl font-semibold">
        Review {isInvoice ? "invoice" : "label"}
      </h1>
      {document.contentType.startsWith("image/") ? (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element -- private file streamed by our own route */}
          <img
            src={fileUrl}
            alt="Uploaded file"
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
          Open the uploaded file
        </a>
      )}
      {document.reviewedAt ? (
        <p>This upload was already reviewed.</p>
      ) : (
        <>
          {review.isExtracted ? (
            <p className="text-sm opacity-70">
              Check every field. Highlighted fields could not be read.
            </p>
          ) : (
            <p className="text-sm text-amber-600">
              We could not read this file. Fill in the fields yourself.
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
          />
          <DocumentDiscardButton documentId={document.id} />
        </>
      )}
    </>
  );
}
