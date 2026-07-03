// backend/src/server.js
'use strict';

const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, '🚀 Trend Validator API listening');
  if (env.AUTH_DISABLED) {
    logger.warn(
      { devUid: env.DEV_USER_UID },
      '⚠️  AUTH_DISABLED=true — Firebase auth bypassed. Disable for production.',
    );
  }
});

const SHUTDOWN_TIMEOUT_MS = 10_000;

function shutdown(signal) {
  logger.info({ signal }, 'Shutdown signal received');
  const killer = setTimeout(() => {
    logger.error('Forced exit after shutdown timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close((err) => {
    clearTimeout(killer);
    if (err) {
      logger.error({ err: err.message }, 'Error during HTTP server close');
      process.exit(1);
    }
    logger.info('HTTP server closed cleanly');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(
    { reason: reason instanceof Error ? reason.message : reason },
    'unhandledRejection',
  );
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'uncaughtException');
  process.exit(1);
});