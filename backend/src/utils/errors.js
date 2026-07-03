'use strict';

class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details = undefined } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
    this.expose = status < 500;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', details) {
    super(message, { status: 400, code: 'BAD_REQUEST', details });
  }
}
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, { status: 401, code: 'UNAUTHORIZED' });
  }
}
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, { status: 403, code: 'FORBIDDEN' });
  }
}
class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, { status: 404, code: 'NOT_FOUND' });
  }
}
class PaymentRequiredError extends AppError {
  constructor(message = 'Insufficient credits') {
    super(message, { status: 402, code: 'INSUFFICIENT_CREDITS' });
  }
}
class UpstreamError extends AppError {
  constructor(message = 'Upstream service error', details) {
    super(message, { status: 502, code: 'UPSTREAM_ERROR', details });
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  PaymentRequiredError,
  UpstreamError,
};
