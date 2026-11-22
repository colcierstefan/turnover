"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { createOrganization } from "@/features/organization/actions/organization.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function OrganizationCreateForm({
  language,
}: Readonly<{ language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].home;
  const [error, formAction, isPending] = useActionState(
    createOrganization,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label={text.organizationNameLabel}
        name="name"
        placeholder={text.organizationNamePlaceholder}
        required
      />
      <Input
        label={text.contactPhoneLabel}
        name="contactPhone"
        type="tel"
        placeholder="+40 712 345 678"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {text.createOrganization}
      </Button>
    </form>
  );
}
