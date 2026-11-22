"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { acceptInvitation } from "@/features/organization/actions/organization.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function OrganizationInvitationAcceptForm({
  token,
  language,
}: Readonly<{ token: string; language: UserLanguage }>) {
  const [error, formAction, isPending] = useActionState(acceptInvitation, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {MANAGER_TEXT[language].invitation.accept}
      </Button>
    </form>
  );
}
