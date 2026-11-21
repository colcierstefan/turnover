"use client";

import { useActionState } from "react";

import Button from "@/components/button";
import CopyButton from "@/components/copy-button";
import Input from "@/components/input";
import { inviteManager } from "@/features/organization/actions/organization.actions";

export default function OrganizationInviteForm({
  organizationName,
}: Readonly<{ organizationName: string }>) {
  const [state, formAction, isPending] = useActionState(inviteManager, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Manager email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
        {state && "error" in state && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <Button type="submit" disabled={isPending}>
          Create invite link
        </Button>
      </form>
      {state && "invitationUrl" in state && (
        <div className="flex flex-col gap-2 rounded bg-foreground/5 p-3 text-sm">
          <p>
            Send this link to {state.email}. It works for 7 days and only for
            that email.
          </p>
          <p className="font-mono break-all">{state.invitationUrl}</p>
          <div className="flex gap-2">
            <CopyButton text={state.invitationUrl} />
            <a
              className="rounded border border-foreground/20 px-4 py-2 text-center font-medium"
              href={`https://wa.me/?text=${encodeURIComponent(
                `Join ${organizationName} on Turnover: ${state.invitationUrl}`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
