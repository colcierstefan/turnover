import { Suspense } from "react";

import organizationService from "@turnover/core/organization/services/organization.service";

import OrganizationInvitationAcceptForm from "@/features/organization/components/invitation/organization-invitation-accept-form";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";
import { getSignedInUser } from "@/features/user/server/user-session.server";

export default function InvitationPage({
  params,
}: PageProps<"/invitations/[token]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Turnover</h1>
      <Suspense fallback={<p>…</p>}>
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
  const text = MANAGER_TEXT[user.language].invitation;

  if (!invitation) return <p>{text.invalid}</p>;
  if (invitation.status === "ACCEPTED") return <p>{text.used}</p>;
  if (invitation.status === "EXPIRED") return <p>{text.expired}</p>;

  return (
    <div className="flex flex-col gap-4">
      <p>
        {text.invitedBefore} <strong>{invitation.organizationName}</strong>{" "}
        {text.invitedAfter}
      </p>
      <p className="text-sm opacity-70">
        {text.inviteFor(invitation.email, user.email)}
      </p>
      <OrganizationInvitationAcceptForm
        token={token}
        language={user.language}
      />
      <a href="/auth/logout" className="text-center text-sm underline">
        {text.logOutForOtherAccount}
      </a>
    </div>
  );
}
