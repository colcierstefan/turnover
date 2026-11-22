"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import Input from "@/components/input";
import { updateContactPhone } from "@/features/organization/actions/organization.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function OrganizationContactPhoneForm({
  contactPhone,
  language,
}: Readonly<{ contactPhone: string | null; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].team;
  const [state, formAction, isPending] = useActionState(
    updateContactPhone,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm opacity-70">{text.emergencyContactIntro}</p>
      <Input
        label={text.contactPhoneLabel}
        name="contactPhone"
        type="tel"
        placeholder="+40 712 345 678"
        defaultValue={contactPhone ?? ""}
        required
      />
      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state && "isSaved" in state && <p className="text-sm">{text.saved}</p>}
      <Button type="submit" disabled={isPending}>
        {text.savePhone}
      </Button>
    </form>
  );
}
