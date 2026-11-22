"use client";

import { useActionState } from "react";

import Button from "@/components/button";
import Input from "@/components/input";
import { createOrganization } from "@/features/organization/actions/organization.actions";

export default function OrganizationCreateForm() {
  const [error, formAction, isPending] = useActionState(
    createOrganization,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Organization name"
        name="name"
        placeholder="e.g. Cluj Stays"
        required
      />
      <Input
        label="Contact phone (shown to guests in an emergency)"
        name="contactPhone"
        type="tel"
        placeholder="+40 712 345 678"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        Create organization
      </Button>
    </form>
  );
}
