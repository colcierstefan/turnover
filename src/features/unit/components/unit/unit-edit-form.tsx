"use client";

import { useActionState } from "react";

import Button from "@/components/button";
import Input from "@/components/input";
import { updateUnit } from "@/features/unit/actions/unit.actions";

export default function UnitEditForm({
  unit,
}: Readonly<{ unit: { id: string; name: string; address: string } }>) {
  const [error, formAction, isPending] = useActionState(updateUnit, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="unitId" value={unit.id} />
      <Input label="Name" name="name" defaultValue={unit.name} required />
      <Input
        label="Address"
        name="address"
        defaultValue={unit.address}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        Save
      </Button>
    </form>
  );
}
