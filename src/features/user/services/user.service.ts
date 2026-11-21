import "server-only";

import userRepository from "@/features/user/repositories/user.repository";
import auth0 from "@/lib/auth0";
import { ValidationError } from "@/lib/errors";

class UserService {
  async getCurrentUser() {
    const session = await auth0.getSession();
    if (!session) return null;

    const { sub, email, name } = session.user;
    if (!email) throw new ValidationError(`Auth0 user ${sub} has no email`);

    return userRepository.upsertByAuth0Id({ auth0Id: sub, email, name });
  }
}

const userService = new UserService();
export default userService;
