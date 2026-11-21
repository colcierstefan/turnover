import { beforeEach, describe, expect, it, vi } from "vitest";

import userRepository from "@/features/user/repositories/user.repository";
import userService from "@/features/user/services/user.service";
import auth0 from "@/lib/auth0";
import { ValidationError } from "@/lib/errors";

vi.mock("@/lib/auth0", () => ({ default: { getSession: vi.fn() } }));
vi.mock("@/features/user/repositories/user.repository", () => ({
  default: { upsertByAuth0Id: vi.fn() },
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

  it("upserts the signed-in Auth0 user and returns the row", async () => {
    const user = {
      id: "user-1",
      auth0Id: "auth0|1",
      email: "host@example.com",
      name: "Host",
    };
    vi.mocked(auth0.getSession).mockResolvedValue({
      user: { sub: "auth0|1", email: "host@example.com", name: "Host" },
      tokenSet: { accessToken: "token", expiresAt: 0 },
      internal: { sid: "sid", createdAt: 0 },
    });
    vi.mocked(userRepository.upsertByAuth0Id).mockResolvedValue(user);

    expect(await userService.getCurrentUser()).toEqual(user);
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
