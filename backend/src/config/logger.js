// backend/src/config/logger.js
'use strict';

const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'trend-validator-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.apiKey',
      '*.api_key',
      '*.privateKey',
      '*.private_key',
      '*.FIREBASE_PRIVATE_KEY',
      '*.FIREBASE_SERVICE_ACCOUNT_JSON',
    ],
    censor: '[REDACTED]',
  },
  transport: env.IS_PROD
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' },
      },
});

module.exports = logger;