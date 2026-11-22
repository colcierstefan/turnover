"use client";

import ConfirmButton from "@/components/confirm-button";
import { deleteAppliance } from "@/features/appliance/actions/appliance.actions";

export default function ApplianceDeleteButton({
  applianceId,
}: Readonly<{ applianceId: string }>) {
  return (
    <ConfirmButton
      variant="danger"
      className="w-full"
      confirmMessage="Delete this appliance? Its label photo and invoice are deleted too unless another appliance uses them."
      onConfirm={() => deleteAppliance({ applianceId })}
    >
      Delete appliance
    </ConfirmButton>
  );
}
