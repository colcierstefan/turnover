import { Suspense } from "react";

import organizationService from "@turnover/core/organization/services/organization.service";

import OrganizationInvitationAcceptForm from "@/features/organization/components/invitation/organization-invitation-accept-form";
import { getSignedInUser } from "@/features/user/server/user-session.server";

export default function InvitationPage({
  params,
}: PageProps<"/invitations/[token]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Turnover</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Invitation params={params} />
      </Suspense>
    </main>
  );
}

async function Invitation({
  params,
}: Readonly<{ params: PageProps<"/invitations/[token]">["params"] }>) {
  const { token } = await params;
  const user = await getSignedInUser(`/invitations/${token}`);
  const invitation = await organizationService.getInvitation(token);

  if (!invitation) return <p>This invite link is not valid.</p>;
  if (invitation.status === "ACCEPTED") {
    return <p>This invite link was already used.</p>;
  }
  if (invitation.status === "EXPIRED") {
    return <p>This invite link has expired. Ask for a new one.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p>
        You are invited to join <strong>{invitation.organizationName}</strong>{" "}
        as a manager.
      </p>
      <p className="text-sm opacity-70">
        Invite for {invitation.email}, you are signed in as {user.email}.
      </p>
      <OrganizationInvitationAcceptForm token={token} />
      <a href="/auth/logout" className="text-center text-sm underline">
        Log out to use a different account
      </a>
    </div>
  );
}
