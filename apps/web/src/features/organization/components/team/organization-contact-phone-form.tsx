"use client";

import { useActionState } from "react";

import Button from "@/components/button";
import Input from "@/components/input";
import { updateContactPhone } from "@/features/organization/actions/organization.actions";

export default function OrganizationContactPhoneForm({
  contactPhone,
}: Readonly<{ contactPhone: string | null }>) {
  const [state, formAction, isPending] = useActionState(
    updateContactPhone,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm opacity-70">
        Guests and cleaners see this number when they report an emergency.
      </p>
      <Input
        label="Contact phone"
        name="contactPhone"
        type="tel"
        placeholder="+40 712 345 678"
        defaultValue={contactPhone ?? ""}
        required
      />
      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state && "isSaved" in state && <p className="text-sm">Saved.</p>}
      <Button type="submit" disabled={isPending}>
        Save phone
      </Button>
    </form>
  );
}
