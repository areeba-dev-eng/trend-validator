'use strict';

const logger = require('../config/logger');
const env = require('../config/env');
const { AppError } = require('../utils/errors');

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, { status: 404, code: 'NOT_FOUND' }));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
  const expose = err instanceof AppError ? err.expose : status < 500;

  const payload = {
    error: {
      code,
      message: expose ? err.message : 'Internal server error',
    },
  };
  if (expose && err.details) payload.error.details = err.details;
  if (!env.IS_PROD && err.stack) payload.error.stack = err.stack;

  const logFn = status >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger);
  logFn(
    {
      err: { message: err.message, code, status, stack: err.stack },
      reqId: req.id,
      uid: req.user?.uid,
      path: req.originalUrl,
      method: req.method,
    },
    'Request failed',
  );

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
