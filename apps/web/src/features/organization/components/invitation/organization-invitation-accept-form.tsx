"use client";

import { useActionState } from "react";

import Button from "@/components/button";
import { acceptInvitation } from "@/features/organization/actions/organization.actions";

export default function OrganizationInvitationAcceptForm({
  token,
}: Readonly<{ token: string }>) {
  const [error, formAction, isPending] = useActionState(acceptInvitation, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        Accept invitation
      </Button>
    </form>
  );
}
