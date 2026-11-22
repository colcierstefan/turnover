"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { updateUnit } from "@/features/unit/actions/unit.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitEditForm({
  unit,
  language,
}: Readonly<{
  unit: { id: string; name: string; address: string };
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const [error, formAction, isPending] = useActionState(updateUnit, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="unitId" value={unit.id} />
      <Input
        label={text.units.nameLabel}
        name="name"
        defaultValue={unit.name}
        required
      />
      <Input
        label={text.units.addressLabel}
        name="address"
        defaultValue={unit.address}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {text.save}
      </Button>
    </form>
  );
}
