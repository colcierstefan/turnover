"use client";

import { useActionState } from "react";

import type { ApplianceFields as ApplianceFieldValues } from "@turnover/core/appliance/schemas/appliance.schema";

import Button from "@/components/button";
import {
  createAppliance,
  updateAppliance,
} from "@/features/appliance/actions/appliance.actions";
import ApplianceFields from "@/features/appliance/components/appliance/appliance-fields";

export default function ApplianceForm({
  target,
  values,
}: Readonly<{
  target: { unitId: string } | { applianceId: string };
  values: Record<keyof ApplianceFieldValues, string>;
}>) {
  const isCreate = "unitId" in target;
  const [error, formAction, isPending] = useActionState(
    isCreate ? createAppliance : updateAppliance,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isCreate ? (
        <input type="hidden" name="unitId" value={target.unitId} />
      ) : (
        <input type="hidden" name="applianceId" value={target.applianceId} />
      )}
      <ApplianceFields values={values} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isCreate ? "Add appliance" : "Save"}
      </Button>
    </form>
  );
}
