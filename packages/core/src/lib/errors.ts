export type UserErrorReason =
  | "ALREADY_IN_ORGANIZATION"
  | "ALREADY_IN_TEAM"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_USED"
  | "INVITATION_EXPIRED"
  | "EMAIL_NOT_VERIFIED"
  | "INVITATION_EMAIL_MISMATCH"
  | "DOCUMENT_ALREADY_REVIEWED";

export class AppError extends Error {
  constructor(
    message: string,
    readonly reason?: UserErrorReason,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  name = "NotFoundError";
}

export class ForbiddenError extends AppError {
  name = "ForbiddenError";
}

export class ValidationError extends AppError {
  name = "ValidationError";
}

export class TooManyRequestsError extends AppError {
  name = "TooManyRequestsError";
}
