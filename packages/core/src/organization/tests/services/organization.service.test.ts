import { beforeEach, describe, expect, it, vi } from "vitest";

import prisma from "@turnover/core/lib/db";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@turnover/core/lib/errors";
import invitationRepository from "@turnover/core/organization/repositories/invitation.repository";
import membershipRepository from "@turnover/core/organization/repositories/membership.repository";
import organizationRepository from "@turnover/core/organization/repositories/organization.repository";
import organizationService from "@turnover/core/organization/services/organization.service";
import type { MembershipRole } from "@turnover/db/client";

vi.mock("@turnover/core/lib/db", () => ({
  default: {
    $transaction: vi.fn((run: (transaction: unknown) => unknown) =>
      run("transaction"),
    ),
  },
}));
vi.mock(
  "@turnover/core/organization/repositories/organization.repository",
  () => ({
    default: { create: vi.fn() },
  }),
);
vi.mock(
  "@turnover/core/organization/repositories/membership.repository",
  () => ({
    default: {
      findByUserId: vi.fn(),
      findByOrganizationIdAndEmail: vi.fn(),
      listByOrganizationId: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  }),
);
vi.mock(
  "@turnover/core/organization/repositories/invitation.repository",
  () => ({
    default: {
      create: vi.fn(),
      findByToken: vi.fn(),
      listPendingByOrganizationId: vi.fn(),
      markAccepted: vi.fn(),
    },
  }),
);

const organization = {
  id: "org-1",
  name: "Cluj Stays",
  createdAt: new Date("2026-11-01T00:00:00Z"),
};

const buildMembership = (
  userId: string,
  role: MembershipRole,
  organizationId = organization.id,
) => ({
  organizationId,
  userId,
  role,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  organization: { ...organization, id: organizationId },
});

const buildInvitation = (
  overrides: Partial<{ acceptedAt: Date | null; expiresAt: Date }> = {},
) => ({
  id: "invitation-1",
  organizationId: organization.id,
  email: "manager@example.com",
  invitedById: "owner-1",
  token: "token-1",
  expiresAt: new Date(Date.now() + 60_000),
  acceptedAt: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  organization,
  ...overrides,
});

const invitedUser = {
  id: "manager-1",
  email: "manager@example.com",
  isEmailVerified: true,
};

describe("OrganizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireMembership", () => {
    it("throws a ForbiddenError when the user has no organization", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(null);

      await expect(
        organizationService.requireMembership("user-1"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws a ForbiddenError when the user belongs to another organization", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("user-1", "OWNER", "org-2"),
      );

      await expect(
        organizationService.requireMembership("user-1", organization.id),
      ).rejects.toThrow(ForbiddenError);
    });

    it("returns the membership when the user belongs to the organization", async () => {
      const membership = buildMembership("user-1", "MANAGER");
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        membership,
      );

      expect(
        await organizationService.requireMembership("user-1", organization.id),
      ).toEqual(membership);
    });
  });

  describe("createOrganization", () => {
    it("creates the organization with the user as owner", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(organizationRepository.create).mockResolvedValue(organization);

      expect(
        await organizationService.createOrganization("user-1", {
          name: "Cluj Stays",
        }),
      ).toEqual(organization);
      expect(membershipRepository.create).toHaveBeenCalledWith(
        { organizationId: organization.id, userId: "user-1", role: "OWNER" },
        "transaction",
      );
    });

    it("throws a ValidationError when the user already belongs to an organization", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("user-1", "MANAGER"),
      );

      await expect(
        organizationService.createOrganization("user-1", { name: "Second" }),
      ).rejects.toThrow(ValidationError);
      expect(organizationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getTeam", () => {
    it("throws a ForbiddenError when the user has no organization", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(null);

      await expect(organizationService.getTeam("user-1")).rejects.toThrow(
        ForbiddenError,
      );
      expect(membershipRepository.listByOrganizationId).not.toHaveBeenCalled();
    });
  });

  describe("inviteManager", () => {
    it("creates a 7-day invitation for the owner's organization", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("owner-1", "OWNER"),
      );
      vi.mocked(
        membershipRepository.findByOrganizationIdAndEmail,
      ).mockResolvedValue(null);

      await organizationService.inviteManager("owner-1", {
        email: "manager@example.com",
      });

      const data = vi.mocked(invitationRepository.create).mock.calls[0][0];
      expect(data).toMatchObject({
        organizationId: organization.id,
        email: "manager@example.com",
        invitedById: "owner-1",
      });
      expect(data.token).toHaveLength(32);
      expect(new Date(data.expiresAt).getTime() - Date.now()).toBeGreaterThan(
        6.9 * 24 * 60 * 60 * 1000,
      );
    });

    it("throws a ForbiddenError when a manager invites", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("manager-1", "MANAGER"),
      );

      await expect(
        organizationService.inviteManager("manager-1", {
          email: "other@example.com",
        }),
      ).rejects.toThrow(ForbiddenError);
      expect(invitationRepository.create).not.toHaveBeenCalled();
    });

    it("throws a ForbiddenError when a user without organization invites", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(null);

      await expect(
        organizationService.inviteManager("user-1", {
          email: "other@example.com",
        }),
      ).rejects.toThrow(ForbiddenError);
      expect(invitationRepository.create).not.toHaveBeenCalled();
    });

    it("throws a ValidationError when the email is already in the team", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("owner-1", "OWNER"),
      );
      vi.mocked(
        membershipRepository.findByOrganizationIdAndEmail,
      ).mockResolvedValue(buildMembership("manager-1", "MANAGER"));

      await expect(
        organizationService.inviteManager("owner-1", {
          email: "manager@example.com",
        }),
      ).rejects.toThrow(ValidationError);
      expect(invitationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("removeManager", () => {
    it("removes a manager of the owner's organization", async () => {
      vi.mocked(membershipRepository.findByUserId)
        .mockResolvedValueOnce(buildMembership("owner-1", "OWNER"))
        .mockResolvedValueOnce(buildMembership("manager-1", "MANAGER"));

      await organizationService.removeManager("owner-1", {
        userId: "manager-1",
      });

      expect(membershipRepository.delete).toHaveBeenCalledWith(
        organization.id,
        "manager-1",
      );
    });

    it("throws a ForbiddenError when a manager removes someone", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("manager-1", "MANAGER"),
      );

      await expect(
        organizationService.removeManager("manager-1", { userId: "manager-2" }),
      ).rejects.toThrow(ForbiddenError);
      expect(membershipRepository.delete).not.toHaveBeenCalled();
    });

    it("throws a NotFoundError when the member belongs to another organization", async () => {
      vi.mocked(membershipRepository.findByUserId)
        .mockResolvedValueOnce(buildMembership("owner-1", "OWNER"))
        .mockResolvedValueOnce(
          buildMembership("manager-9", "MANAGER", "org-2"),
        );

      await expect(
        organizationService.removeManager("owner-1", { userId: "manager-9" }),
      ).rejects.toThrow(NotFoundError);
      expect(membershipRepository.delete).not.toHaveBeenCalled();
    });

    it("throws a ValidationError when removing the owner", async () => {
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("owner-1", "OWNER"),
      );

      await expect(
        organizationService.removeManager("owner-1", { userId: "owner-1" }),
      ).rejects.toThrow(ValidationError);
      expect(membershipRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("getInvitation", () => {
    it("returns null for an unknown token", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(null);

      expect(await organizationService.getInvitation("missing")).toBeNull();
    });

    it("reports an expired invitation as EXPIRED", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation({ expiresAt: new Date(Date.now() - 1000) }),
      );

      expect(await organizationService.getInvitation("token-1")).toEqual({
        email: "manager@example.com",
        organizationName: "Cluj Stays",
        status: "EXPIRED",
      });
    });
  });

  describe("acceptInvitation", () => {
    it("adds the user as manager and marks the invitation accepted", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation(),
      );
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(null);

      await organizationService.acceptInvitation(invitedUser, {
        token: "token-1",
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(membershipRepository.create).toHaveBeenCalledWith(
        {
          organizationId: organization.id,
          userId: "manager-1",
          role: "MANAGER",
        },
        "transaction",
      );
      expect(invitationRepository.markAccepted).toHaveBeenCalledWith(
        "invitation-1",
        expect.any(Date),
        "transaction",
      );
    });

    it("throws a NotFoundError for an unknown token", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(null);

      await expect(
        organizationService.acceptInvitation(invitedUser, { token: "missing" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws a ValidationError when the invitation was already accepted", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation({ acceptedAt: new Date() }),
      );

      await expect(
        organizationService.acceptInvitation(invitedUser, { token: "token-1" }),
      ).rejects.toThrow(ValidationError);
      expect(membershipRepository.create).not.toHaveBeenCalled();
    });

    it("throws a ValidationError when the invitation has expired", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(
        organizationService.acceptInvitation(invitedUser, { token: "token-1" }),
      ).rejects.toThrow(ValidationError);
      expect(membershipRepository.create).not.toHaveBeenCalled();
    });

    it("throws a ForbiddenError when the user's email is not verified", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation(),
      );

      await expect(
        organizationService.acceptInvitation(
          { ...invitedUser, isEmailVerified: false },
          { token: "token-1" },
        ),
      ).rejects.toThrow(ForbiddenError);
      expect(membershipRepository.create).not.toHaveBeenCalled();
    });

    it("throws a ForbiddenError when the signed-in email differs from the invited one", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation(),
      );

      await expect(
        organizationService.acceptInvitation(
          { ...invitedUser, email: "someone@example.com" },
          { token: "token-1" },
        ),
      ).rejects.toThrow(ForbiddenError);
      expect(membershipRepository.create).not.toHaveBeenCalled();
    });

    it("accepts when the signed-in email differs only in letter case", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation(),
      );
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(null);

      await organizationService.acceptInvitation(
        { ...invitedUser, email: "Manager@Example.com" },
        { token: "token-1" },
      );

      expect(membershipRepository.create).toHaveBeenCalled();
    });

    it("throws a ValidationError when the user already belongs to an organization", async () => {
      vi.mocked(invitationRepository.findByToken).mockResolvedValue(
        buildInvitation(),
      );
      vi.mocked(membershipRepository.findByUserId).mockResolvedValue(
        buildMembership("manager-1", "OWNER", "org-2"),
      );

      await expect(
        organizationService.acceptInvitation(invitedUser, { token: "token-1" }),
      ).rejects.toThrow(ValidationError);
      expect(membershipRepository.create).not.toHaveBeenCalled();
    });
  });
});
