'use strict';

require('dotenv').config();

const { z } = require('zod');

const schema = z.object({
  NODE_ENV:   z.enum(['development', 'production', 'test']).default('development'),
  PORT:       z.coerce.number().default(4000),
  LOG_LEVEL:  z.string().default('info'),
  CORS_ORIGINS: z.string().default('*'),

  SERPAPI_KEY:    z.string().min(10, 'SERPAPI_KEY is required'),
  OPENAI_API_KEY: z.string().min(10, 'OPENAI_API_KEY is required'),
  OPENAI_MODEL:   z.string().default('gpt-4o-mini'),
  GROQ_API_KEY:   z.string().optional(),
  GROQ_MODEL:     z.string().default('llama-3.3-70b-versatile'),

  ANALYZE_COST:    z.coerce.number().min(0).default(1),
  DEFAULT_CREDITS: z.coerce.number().min(1).default(100),

  AI_TIMEOUT_MS:      z.coerce.number().default(25000),
  SERPAPI_TIMEOUT_MS: z.coerce.number().default(15000),

  CACHE_LIVE_TTL_MS:        z.coerce.number().default(300000),
  CACHE_COMPETITORS_TTL_MS: z.coerce.number().default(900000),
  CACHE_TRENDS_TTL_MS:      z.coerce.number().default(1800000),

  YOUTUBE_API_KEY:    z.string().optional(),
  YOUTUBE_TIMEOUT_MS: z.coerce.number().default(10000),

  REDDIT_CLIENT_ID:     z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  REDDIT_USER_AGENT:    z.string().default('TrendValidator/1.0'),
  REDDIT_TIMEOUT_MS:    z.coerce.number().default(12000),

  PRODUCTHUNT_TOKEN:      z.string().optional(),
  PRODUCTHUNT_TIMEOUT_MS: z.coerce.number().default(10000),

  RATE_LIMIT_MAX:       z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

let parsed;
try {
  parsed = schema.parse(process.env);
} catch (err) {
  console.error('[env] Invalid environment configuration:');
  if (err?.errors) {
    err.errors.forEach((e) => console.error(`  ${e.path.join('.')}: ${e.message}`));
  }
  process.exit(1);
}

module.exports = {
  ...parsed,
  CORS_ORIGINS_LIST: parsed.CORS_ORIGINS.split(',').map((s) => s.trim()),
  IS_PROD: parsed.NODE_ENV === 'production',
};
