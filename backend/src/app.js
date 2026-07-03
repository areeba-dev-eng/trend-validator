'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const pinoHttp = require('pino-http');
const crypto = require('crypto');

const env = require('./config/env');
const logger = require('./config/logger');
require('./config/firebase'); // initialise admin SDK eagerly

const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // honor X-Forwarded-For when behind a proxy/LB

/* ---------------- core middleware ---------------- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false, limit: '256kb' }));

const corsOptions = env.CORS_ORIGINS_LIST.includes('*')
  ? { origin: true }
  : { origin: env.CORS_ORIGINS_LIST };
app.use(cors(corsOptions));

/* ---------------- request logging + correlation ---------------- */
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'];
      const id = (typeof existing === 'string' && existing) || crypto.randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }),
);

/* ---------------- health (unauth, before rate limit) ---------------- */
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

/* ---------------- rate limit + API ---------------- */
app.use('/api', apiLimiter, routes);

/* ---------------- 404 + error ---------------- */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
