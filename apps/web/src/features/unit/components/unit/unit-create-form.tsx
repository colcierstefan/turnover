"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { createUnit } from "@/features/unit/actions/unit.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitCreateForm({
  language,
}: Readonly<{ language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].units;
  const [error, formAction, isPending] = useActionState(createUnit, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label={text.nameLabel}
        name="name"
        placeholder={text.namePlaceholder}
        required
      />
      <Input
        label={text.addressLabel}
        name="address"
        placeholder={text.addressPlaceholder}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {text.addUnit}
      </Button>
    </form>
  );
}
