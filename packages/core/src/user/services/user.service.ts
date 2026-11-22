import "server-only";

import auth0 from "@turnover/core/lib/auth0";
import { ForbiddenError, ValidationError } from "@turnover/core/lib/errors";
import userRepository from "@turnover/core/user/repositories/user.repository";

class UserService {
  async getCurrentUser() {
    const session = await auth0.getSession();
    if (!session) return null;

    const { sub, email, name, email_verified } = session.user;
    if (!email) throw new ValidationError(`Auth0 user ${sub} has no email`);

    const user = await userRepository.upsertByAuth0Id({
      auth0Id: sub,
      email,
      name,
    });
    return { ...user, isEmailVerified: email_verified === true };
  }

  async requireCurrentUser() {
    const user = await this.getCurrentUser();
    if (!user) throw new ForbiddenError("Not signed in");
    return user;
  }
}

const userService = new UserService();
export default userService;
