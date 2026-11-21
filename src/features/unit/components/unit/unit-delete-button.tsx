"use client";

import Button from "@/components/button";
import { deleteUnit } from "@/features/unit/actions/unit.actions";

export default function UnitDeleteButton({
  unit,
}: Readonly<{ unit: { id: string; name: string } }>) {
  return (
    <form
      action={deleteUnit}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${unit.name}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="unitId" value={unit.id} />
      <Button type="submit" variant="danger" className="w-full">
        Delete unit
      </Button>
    </form>
  );
}
