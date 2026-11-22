"use client";

import ConfirmButton from "@/components/confirm-button";
import { regenerateReportToken } from "@/features/unit/actions/unit.actions";

export default function UnitRegenerateLinkButton({
  unitId,
}: Readonly<{ unitId: string }>) {
  return (
    <ConfirmButton
      variant="secondary"
      confirmMessage="The current link and QR code will stop working at once. Continue?"
      onConfirm={() => regenerateReportToken({ unitId })}
    >
      New link
    </ConfirmButton>
  );
}
