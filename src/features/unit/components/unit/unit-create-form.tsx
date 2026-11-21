"use client";

import { useActionState } from "react";

import Button from "@/components/button";
import Input from "@/components/input";
import { createUnit } from "@/features/unit/actions/unit.actions";

export default function UnitCreateForm() {
  const [error, formAction, isPending] = useActionState(createUnit, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Name"
        name="name"
        placeholder="e.g. Old Town studio"
        required
      />
      <Input
        label="Address"
        name="address"
        placeholder="Street, number, apartment, city"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        Add unit
      </Button>
    </form>
  );
}
