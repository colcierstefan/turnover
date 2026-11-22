import { Suspense } from "react";

import organizationService from "@turnover/core/organization/services/organization.service";

import AppHeader from "@/components/app-header";
import Card from "@/components/card";
import OrganizationContactPhoneForm from "@/features/organization/components/team/organization-contact-phone-form";
import OrganizationInviteForm from "@/features/organization/components/team/organization-invite-form";
import OrganizationMemberList from "@/features/organization/components/team/organization-member-list";
import OrganizationPendingInvitationList from "@/features/organization/components/team/organization-pending-invitation-list";
import { getInvitationUrl } from "@/features/organization/server/organization-invitation-link.server";
import { getSignedInMembership } from "@/features/organization/server/organization-membership.server";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function TeamPage() {
  return (
    <Suspense fallback={<p className="p-6">…</p>}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  const { user, membership } = await getSignedInMembership("/team");
  const { members, pendingInvitations } = await organizationService.getTeam(
    user.id,
  );
  const isOwner = membership.role === "OWNER";
  const text = MANAGER_TEXT[user.language].team;

  return (
    <>
      <AppHeader language={user.language} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <Card title={text.membersTitle}>
          <OrganizationMemberList
            members={members}
            canRemoveManagers={isOwner}
            language={user.language}
          />
        </Card>
        {isOwner && (
          <>
            <Card title={text.emergencyContactTitle}>
              <OrganizationContactPhoneForm
                contactPhone={membership.organization.contactPhone}
                language={user.language}
              />
            </Card>
            <Card title={text.inviteTitle}>
              <OrganizationInviteForm
                organizationName={membership.organization.name}
                language={user.language}
              />
            </Card>
            <Card title={text.pendingTitle}>
              <OrganizationPendingInvitationList
                invitations={pendingInvitations.map((invitation) => ({
                  ...invitation,
                  invitationUrl: getInvitationUrl(invitation.token),
                }))}
                language={user.language}
              />
            </Card>
          </>
        )}
      </main>
    </>
  );
}
