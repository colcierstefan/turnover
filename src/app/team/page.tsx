import { Suspense } from "react";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import OrganizationInviteForm from "@/features/organization/components/team/organization-invite-form";
import OrganizationMemberList from "@/features/organization/components/team/organization-member-list";
import OrganizationPendingInvitationList from "@/features/organization/components/team/organization-pending-invitation-list";
import { getInvitationUrl } from "@/features/organization/server/organization-invitation-link.server";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import organizationService from "@/features/organization/services/organization.service";

export default function TeamPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold">Team</h1>
        <Suspense fallback={<p>Loading…</p>}>
          <Team />
        </Suspense>
      </main>
    </>
  );
}

async function Team() {
  const { user, membership } = await getSignedInMembership("/team");
  const { members, pendingInvitations } = await organizationService.getTeam(
    user.id,
  );
  const isOwner = membership.role === "OWNER";

  return (
    <>
      <Card title="Members">
        <OrganizationMemberList members={members} canRemoveManagers={isOwner} />
      </Card>
      {isOwner && (
        <>
          <Card title="Invite a manager">
            <OrganizationInviteForm
              organizationName={membership.organization.name}
            />
          </Card>
          <Card title="Pending invites">
            <OrganizationPendingInvitationList
              invitations={pendingInvitations.map((invitation) => ({
                ...invitation,
                invitationUrl: getInvitationUrl(invitation.token),
              }))}
            />
          </Card>
        </>
      )}
    </>
  );
}
