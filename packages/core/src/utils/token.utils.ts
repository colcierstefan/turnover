import "server-only";

import { randomBytes } from "node:crypto";

export const generateToken = () => randomBytes(24).toString("base64url");
