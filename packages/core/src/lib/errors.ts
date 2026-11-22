export class NotFoundError extends Error {
  name = "NotFoundError";
}

export class ForbiddenError extends Error {
  name = "ForbiddenError";
}

export class ValidationError extends Error {
  name = "ValidationError";
}

export class TooManyRequestsError extends Error {
  name = "TooManyRequestsError";
}
