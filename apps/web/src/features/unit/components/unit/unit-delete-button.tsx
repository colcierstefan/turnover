"use client";

import ConfirmButton from "@/components/confirm-button";
import { deleteUnit } from "@/features/unit/actions/unit.actions";

export default function UnitDeleteButton({
  unit,
  applianceCount,
  documentCount,
  issueCount,
}: Readonly<{
  unit: { id: string; name: string };
  applianceCount: number;
  documentCount: number;
  issueCount: number;
}>) {
  const contents =
    applianceCount + documentCount + issueCount > 0
      ? ` This also deletes ${pluralize(applianceCount, "appliance")}, ${pluralize(documentCount, "document")} and ${pluralize(issueCount, "issue")}.`
      : "";

  return (
    <ConfirmButton
      variant="danger"
      className="w-full"
      confirmMessage={`Delete ${unit.name}?${contents} This cannot be undone.`}
      onConfirm={() => deleteUnit({ unitId: unit.id })}
    >
      Delete unit
    </ConfirmButton>
  );
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;
