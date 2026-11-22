"use client";

import { useActionState } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import CopyButton from "@/components/copy-button";
import Input from "@/components/input";
import { inviteManager } from "@/features/organization/actions/organization.actions";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function OrganizationInviteForm({
  organizationName,
  language,
}: Readonly<{ organizationName: string; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language];
  const [state, formAction, isPending] = useActionState(inviteManager, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label={text.team.managerEmailLabel}
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
        {state && "error" in state && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <Button type="submit" disabled={isPending}>
          {text.team.createInvite}
        </Button>
      </form>
      {state && "invitationUrl" in state && (
        <div className="flex flex-col gap-2 rounded bg-foreground/5 p-3 text-sm">
          <p>{text.team.sendLink(state.email)}</p>
          <p className="font-mono break-all">{state.invitationUrl}</p>
          <div className="flex gap-2">
            <CopyButton
              text={state.invitationUrl}
              copyLabel={text.copyLink}
              copiedLabel={text.copied}
            />
            <a
              className="rounded border border-foreground/20 px-4 py-2 text-center font-medium"
              href={`https://wa.me/?text=${encodeURIComponent(
                text.team.whatsAppMessage(
                  organizationName,
                  state.invitationUrl,
                ),
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {text.team.shareOnWhatsApp}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
