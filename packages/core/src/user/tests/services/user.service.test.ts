import { beforeEach, describe, expect, it, vi } from "vitest";

import auth0 from "@turnover/core/lib/auth0";
import { ForbiddenError, ValidationError } from "@turnover/core/lib/errors";
import userRepository from "@turnover/core/user/repositories/user.repository";
import userService from "@turnover/core/user/services/user.service";

vi.mock("@turnover/core/lib/auth0", () => ({
  default: { getSession: vi.fn() },
}));
vi.mock("@turnover/core/user/repositories/user.repository", () => ({
  default: { upsertByAuth0Id: vi.fn(), update: vi.fn() },
}));

describe("UserService.getCurrentUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns null when nobody is signed in", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue(null);

    expect(await userService.getCurrentUser()).toBeNull();
    expect(userRepository.upsertByAuth0Id).not.toHaveBeenCalled();
  });

  it("upserts the signed-in Auth0 user and returns the row with its email verification", async () => {
    const user = {
      id: "user-1",
      auth0Id: "auth0|1",
      email: "host@example.com",
      name: "Host",
      language: null,
      createdAt: new Date("2026-11-21T00:00:00Z"),
    };
    vi.mocked(auth0.getSession).mockResolvedValue({
      user: {
        sub: "auth0|1",
        email: "host@example.com",
        name: "Host",
        email_verified: true,
      },
      tokenSet: { accessToken: "token", expiresAt: 0 },
      internal: { sid: "sid", createdAt: 0 },
    });
    vi.mocked(userRepository.upsertByAuth0Id).mockResolvedValue(user);

    expect(await userService.getCurrentUser()).toEqual({
      ...user,
      isEmailVerified: true,
    });
    expect(userRepository.upsertByAuth0Id).toHaveBeenCalledWith({
      auth0Id: "auth0|1",
      email: "host@example.com",
      name: "Host",
    });
  });

  it("throws a ValidationError when the Auth0 user has no email", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue({
      user: { sub: "auth0|2" },
      tokenSet: { accessToken: "token", expiresAt: 0 },
      internal: { sid: "sid", createdAt: 0 },
    });

    await expect(userService.getCurrentUser()).rejects.toThrow(ValidationError);
  });
});

describe("UserService.requireCurrentUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws a ForbiddenError when nobody is signed in", async () => {
    vi.mocked(auth0.getSession).mockResolvedValue(null);

    await expect(userService.requireCurrentUser()).rejects.toThrow(
      ForbiddenError,
    );
  });
});

describe("UserService.updateLanguage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("stores the chosen language on the user", async () => {
    await userService.updateLanguage("user-1", "RO");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      language: "RO",
    });
  });
});
