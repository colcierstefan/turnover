import "server-only";

import prisma from "@turnover/core/lib/db";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@turnover/core/lib/errors";
import { INVITATION_TTL_MS } from "@turnover/core/organization/constants/organization.constants";
import invitationRepository from "@turnover/core/organization/repositories/invitation.repository";
import membershipRepository from "@turnover/core/organization/repositories/membership.repository";
import organizationRepository from "@turnover/core/organization/repositories/organization.repository";
import type {
  AcceptInvitationInput,
  CreateOrganizationInput,
  InviteManagerInput,
  RemoveManagerInput,
  UpdateContactPhoneInput,
} from "@turnover/core/organization/schemas/organization.schema";
import { generateToken } from "@turnover/core/utils/token.utils";

type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

class OrganizationService {
  getMembershipForUser(userId: string) {
    return membershipRepository.findByUserId(userId);
  }

  async requireMembership(userId: string, organizationId?: string) {
    const membership = await membershipRepository.findByUserId(userId);
    if (!membership) {
      throw new ForbiddenError(`User ${userId} has no organization`);
    }
    if (organizationId && membership.organizationId !== organizationId) {
      throw new ForbiddenError(
        `User ${userId} is not a member of organization ${organizationId}`,
      );
    }
    return membership;
  }

  async createOrganization(userId: string, input: CreateOrganizationInput) {
    if (await membershipRepository.findByUserId(userId)) {
      throw new ValidationError(
        "You already belong to an organization",
        "ALREADY_IN_ORGANIZATION",
      );
    }

    return prisma.$transaction(async (transaction) => {
      const organization = await organizationRepository.create(
        { name: input.name, contactPhone: input.contactPhone },
        transaction,
      );
      await membershipRepository.create(
        { organizationId: organization.id, userId, role: "OWNER" },
        transaction,
      );
      return organization;
    });
  }

  async getTeam(userId: string) {
    const membership = await this.requireMembership(userId);
    const [members, pendingInvitations] = await Promise.all([
      membershipRepository.listByOrganizationId(membership.organizationId),
      invitationRepository.listPendingByOrganizationId(
        membership.organizationId,
        new Date(),
      ),
    ]);
    return { members, pendingInvitations };
  }

  async updateContactPhone(userId: string, input: UpdateContactPhoneInput) {
    const membership = await this.requireOwner(userId);
    return organizationRepository.update(membership.organizationId, {
      contactPhone: input.contactPhone,
    });
  }

  async inviteManager(userId: string, input: InviteManagerInput) {
    const membership = await this.requireOwner(userId);

    const existingMember =
      await membershipRepository.findByOrganizationIdAndEmail(
        membership.organizationId,
        input.email,
      );
    if (existingMember) {
      throw new ValidationError(
        `${input.email} is already in your team`,
        "ALREADY_IN_TEAM",
      );
    }

    return invitationRepository.create({
      organizationId: membership.organizationId,
      email: input.email,
      invitedById: userId,
      token: generateToken(),
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    });
  }

  async removeManager(userId: string, input: RemoveManagerInput) {
    const membership = await this.requireOwner(userId);

    const target = await membershipRepository.findByUserId(input.userId);
    if (!target || target.organizationId !== membership.organizationId) {
      throw new NotFoundError(`User ${input.userId} is not in this team`);
    }
    if (target.role === "OWNER") {
      throw new ValidationError("The owner cannot be removed");
    }

    await membershipRepository.delete(membership.organizationId, input.userId);
  }

  async getInvitation(token: string) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) return null;

    return {
      email: invitation.email,
      organizationName: invitation.organization.name,
      status: getInvitationStatus(invitation),
    };
  }

  async acceptInvitation(
    user: Readonly<{ id: string; email: string; isEmailVerified: boolean }>,
    input: AcceptInvitationInput,
  ) {
    const invitation = await invitationRepository.findByToken(input.token);
    if (!invitation) {
      throw new NotFoundError(
        "This invitation does not exist",
        "INVITATION_NOT_FOUND",
      );
    }

    const status = getInvitationStatus(invitation);
    if (status === "ACCEPTED") {
      throw new ValidationError(
        "This invitation was already used",
        "INVITATION_USED",
      );
    }
    if (status === "EXPIRED") {
      throw new ValidationError(
        "This invitation has expired",
        "INVITATION_EXPIRED",
      );
    }
    if (!user.isEmailVerified) {
      throw new ForbiddenError(
        "Verify your email address first",
        "EMAIL_NOT_VERIFIED",
      );
    }
    if (user.email.toLowerCase() !== invitation.email) {
      throw new ForbiddenError(
        `This invitation is for ${invitation.email}, but you are signed in as ${user.email}`,
        "INVITATION_EMAIL_MISMATCH",
      );
    }
    if (await membershipRepository.findByUserId(user.id)) {
      throw new ValidationError(
        "You already belong to an organization",
        "ALREADY_IN_ORGANIZATION",
      );
    }

    await prisma.$transaction(async (transaction) => {
      await membershipRepository.create(
        {
          organizationId: invitation.organizationId,
          userId: user.id,
          role: "MANAGER",
        },
        transaction,
      );
      await invitationRepository.markAccepted(
        invitation.id,
        new Date(),
        transaction,
      );
    });
  }

  private async requireOwner(userId: string) {
    const membership = await this.requireMembership(userId);
    if (membership.role !== "OWNER") {
      throw new ForbiddenError("Only the owner can manage the team");
    }
    return membership;
  }
}

const getInvitationStatus = (
  invitation: Readonly<{ acceptedAt: Date | null; expiresAt: Date }>,
): InvitationStatus => {
  if (invitation.acceptedAt) return "ACCEPTED";
  if (invitation.expiresAt <= new Date()) return "EXPIRED";
  return "PENDING";
};

const organizationService = new OrganizationService();
export default organizationService;
