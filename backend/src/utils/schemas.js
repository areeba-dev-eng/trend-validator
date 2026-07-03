// 'use strict';

// const { z } = require('zod');

// const analyzeSchema = z.object({
//   body: z.object({
//     query: z
//       .string({ required_error: 'query is required' })
//       .trim()
//       .min(2, 'query must be at least 2 characters')
//       .max(160, 'query must be at most 160 characters'),
//     geo: z.string().trim().min(2).max(5).optional(), // e.g. "US", "PK"
//     timeframe: z.string().trim().max(40).optional(), // e.g. "today 12-m"
//   }),
// });

// module.exports = { analyzeSchema };
// src/utils/schemas.js
'use strict';

const { z } = require('zod');

const analyzeSchema = z.object({
  body: z.object({
    query: z
      .string({ required_error: 'query is required' })
      .trim()
      .min(2, 'query must be at least 2 characters')
      .max(160, 'query must be at most 160 characters'),
    geo: z.string().trim().min(2).max(5).optional(),
    timeframe: z.string().trim().max(40).optional(),
  }),
});

/* Shared shape for the 3 new keyword-only endpoints. */
const keywordSchema = z.object({
  body: z.object({
    keyword: z
      .string({ required_error: 'keyword is required' })
      .trim()
      .min(2, 'keyword must be at least 2 characters')
      .max(160, 'keyword must be at most 160 characters'),
  }),
});

module.exports = {
  analyzeSchema,
  ideaSchema:     keywordSchema,
  insightsSchema: keywordSchema,
  nicheSchema:    keywordSchema,
};
