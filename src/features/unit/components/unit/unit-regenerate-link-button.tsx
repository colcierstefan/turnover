"use client";

import Button from "@/components/button";
import { regenerateReportToken } from "@/features/unit/actions/unit.actions";

export default function UnitRegenerateLinkButton({
  unitId,
}: Readonly<{ unitId: string }>) {
  return (
    <form
      action={regenerateReportToken}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "The current link and QR code will stop working at once. Continue?",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="unitId" value={unitId} />
      <Button type="submit" variant="secondary">
        New link
      </Button>
    </form>
  );
}
