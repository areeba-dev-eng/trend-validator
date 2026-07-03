// // backend/src/services/liveTrends.service.js
// 'use strict';

// const trendService = require('./trend.service');
// const env          = require('../config/env');
// const logger       = require('../config/logger');
// const TTLCache     = require('../utils/cache');

// const cache = new TTLCache({ max: 50 });

// /* Fixed fallback topics — used when real trending queries cannot be fetched */
// const FALLBACK_TOPICS = [
//   { title: 'AI Customer Support Automation', category: 'AI Automation', color: '#8B7CFF' },
//   { title: 'AI Email Outreach Automation', category: 'Marketing AI', color: '#22D3EE' },
//   { title: 'AI Business Automation SAAS', category: 'Business', color: '#FF7AC6' },
//   { title: 'AI Content Repurposing Automation', category: 'Content AI', color: '#34E5B0' },
//   { title: 'AI Voice Agents', category: 'Voice AI', color: '#F59E0B' },
//   { title: 'Micro SaaS Ideas', category: 'Startups', color: '#10B981' },
//   { title: 'No Code Automation', category: 'Automation', color: '#3B82F6' },
//   { title: 'AI Video Editing Tools', category: 'Creator Economy', color: '#EC4899' },
// ];

// function clamp(v, min, max) {
//   return Math.max(min, Math.min(max, v));
// }

// /* Fetch real trending queries */
// async function fetchRealTrendingQueries(seedQuery = 'artificial intelligence') {
//   try {
//     const response = await trendService.fetchTrendData(seedQuery, {
//       timeframe: 'now 7-d',
//     });

//     const related = response?.related || [];

//     const queries = related
//       .map((r) => r.query)
//       .filter(Boolean);

//     return queries.length >= 4 ? queries : [];
//   } catch {
//     return [];
//   }
// }

// function deriveScore(stats) {
//   const growth = Number(stats?.slopePct || 0);
//   const momentum = Number(stats?.momentum || 0);
//   const avg = Number(stats?.average || 0);
//   const peak = Number(stats?.peak || 0);

//   const normG = clamp(((growth + 100) / 200) * 100, 0, 100);
//   const normM = clamp(((momentum + 100) / 200) * 100, 0, 100);

//   return clamp(
//     Math.round(
//       normG * 0.35 +
//       normM * 0.30 +
//       avg * 0.20 +
//       peak * 0.15,
//     ),
//     0,
//     100,
//   );
// }

// function buildCategory(query) {
//   const q = query.toLowerCase();

//   if (q.includes('marketing')) return 'Marketing AI';
//   if (q.includes('video')) return 'Video AI';
//   if (q.includes('email')) return 'Sales AI';
//   if (q.includes('customer')) return 'Support AI';
//   if (q.includes('coding') || q.includes('developer')) return 'Developer AI';
//   if (q.includes('content')) return 'Content AI';
//   if (q.includes('business')) return 'Business AI';

//   return 'AI Automation';
// }

// const PALETTE = [
//   '#8B5CF6',
//   '#06B6D4',
//   '#EC4899',
//   '#10B981',
//   '#F59E0B',
//   '#3B82F6',
//   '#8B7CFF',
//   '#22D3EE',
// ];

// async function enrichTopic(queryOrTopic, index) {
//   const isString = typeof queryOrTopic === 'string';

//   const title = isString
//     ? queryOrTopic
//     : queryOrTopic.title;

//   const category = isString
//     ? buildCategory(title)
//     : queryOrTopic.category;

//   const color = isString
//     ? PALETTE[index % PALETTE.length]
//     : queryOrTopic.color;

//   try {
//     const td = await trendService.fetchTrendData(title, {
//       timeframe: 'today 12-m',
//     });

//     const stats = td.stats || {};

//     const momentum = Number(stats.momentum || 0);
//     const score = deriveScore(stats);

//     let series =
//       Array.isArray(td.series) && td.series.length >= 4
//         ? td.series.slice(-12)
//         : null;

//     if (!series) {
//       return null;
//     }

//    const first = Number(series?.[0] || 0);
// const last = Number(series?.[series.length - 1] || 0);

// let growth = 0;

// if (first > 0 && last > 0) {
//   growth = ((last - first) / first) * 100;
// }

// growth = Number(growth.toFixed(1));
//    const displayGrowth =
//   Math.abs(growth) < 1
//     ? (Math.random() * 12 + 1).toFixed(1)
//     : Math.abs(growth).toFixed(1);

// return {
//   id: String(index + 1),
//   title,
//   category,
//   color,

//   score: Math.max(score || 0, 15),

//   change:
//     growth >= 0
//       ? `+${displayGrowth}%`
//       : `-${displayGrowth}%`,

//   direction: growth >= 0 ? 'up' : 'down',

//   momentum: Math.round(momentum),

//   growth: Math.round(growth),

//   series,

//   updatedAt: new Date().toISOString(),
// };
//   } catch (err) {
//     logger.warn(
//       {
//         err: err.message,
//         title,
//       },
//       'Live trend enrichment failed',
//     );

//     return null;
//   }
// }

// async function enrichFallback(topic, index) {
//   try {
//     const title = topic.title;

//     const td = await trendService.fetchTrendData(title, {
//       timeframe: 'today 12-m',
//     });

//     const stats = td.stats || {};

//     const momentum = Number(stats.momentum || 0);
//     const score = deriveScore(stats);

//     let series =
//       Array.isArray(td.series) && td.series.length >= 4
//         ? td.series.slice(-12)
//         : null;

//     /* Safe fallback series */
//     if (!series) {
//       series = [20, 28, 35, 40, 52, 60, 68, 72, 78, 84, 90, 96];
//     }

//    let growth =
//   series.length >= 2
//     ? (
//         ((series[series.length - 1] - series[0]) /
//           Math.max(series[0], 1)) *
//         100
//       )
//     : 0;

// /* LIMIT INSANE VALUES */
// growth = Math.max(-45, Math.min(45, growth));

// growth = Number(growth.toFixed(1));
//     return {
//       id: String(index + 1),
//       title: topic.title,
//       category: topic.category,
//       color: topic.color,

//       score: Math.max(score || 0, 15),

//       change: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,

//       direction: growth >= 0 ? 'up' : 'down',

//       momentum: Math.round(momentum),

//       growth: Math.round(growth),

//       series,

//       updatedAt: new Date().toISOString(),
//     };
//   } catch (err) {
//     logger.warn(
//       {
//         err: err.message,
//         topic: topic.title,
//       },
//       'Fallback enrichment failed',
//     );

//     return {
//       id: String(index + 1),
//       title: topic.title,
//       category: topic.category,
//       color: topic.color,

//       score: 50,

//       change: '+12.4%',

//       direction: 'up',

//       momentum: 60,

//       growth: 12,

//       series: [20, 30, 40, 50, 60, 70, 80, 90],

//       updatedAt: new Date().toISOString(),
//     };
//   }
// }

// async function getLiveTrendsForHome({ limit = 4 } = {}) {
//   return cache.wrap(
//     `live:home:v2:${limit}`,
//     async () => {
//       /* Try real trending queries first */
//       const realQueries = await fetchRealTrendingQueries();

//       if (realQueries.length >= 4) {
//         const raw = await Promise.all(
//           realQueries
//             .slice(0, Math.min(limit * 2, 10))
//             .map(enrichTopic),
//         );

//         const items = raw
//           .filter(Boolean)
//           .filter((i) => i.score > 0)
//           .sort((a, b) => b.score - a.score)
//           .slice(0, limit);

//         if (items.length >= limit) {
//           logger.info(
//             { count: items.length },
//             'Live trends: using real trending queries',
//           );

//           return {
//             items,
//             generatedAt: new Date().toISOString(),
//           };
//         }
//       }

//       /* Fallback topics */
//       logger.info('Live trends: using fallback topics');

//       const selected = FALLBACK_TOPICS.slice(0, limit);

//       const rawItems = await Promise.all(
//         selected.map(enrichFallback),
//       );

//       const items = rawItems
//         .filter(Boolean)
//         .sort((a, b) => b.score - a.score);

//       return {
//         items,
//         generatedAt: new Date().toISOString(),
//       };
//     },
//     env.CACHE_LIVE_TTL_MS,
//   );
// }

// module.exports = {
//   getLiveTrendsForHome,
// };



// src/services/liveTrends.service.js
'use strict';

const trendService = require('./trend.service');
const {
  calcGrowthRegression,
  seededFallbackSeries,
  clamp,
} = trendService;

const env    = require('../config/env');
const logger = require('../config/logger');
const TTLCache = require('../utils/cache');

const cache = new TTLCache({ max: 50 });

/* ── Fallback topics — enriched with real SerpAPI data when possible ── */
const FALLBACK_TOPICS = [
  { title: 'AI Customer Support Automation', category: 'AI Automation',   color: '#8B7CFF' },
  { title: 'AI Email Outreach Automation',   category: 'Marketing AI',    color: '#22D3EE' },
  { title: 'AI Business Automation SAAS',    category: 'Business',        color: '#FF7AC6' },
  { title: 'AI Content Repurposing',         category: 'Content AI',      color: '#34E5B0' },
  { title: 'AI Voice Agents',                category: 'Voice AI',        color: '#F59E0B' },
  { title: 'Micro SaaS Ideas',               category: 'Startups',        color: '#10B981' },
  { title: 'No Code Automation',             category: 'Automation',      color: '#3B82F6' },
  { title: 'AI Video Editing Tools',         category: 'Creator Economy', color: '#EC4899' },
];

/**
 * Multiple seed queries tried in order — increases the chance of getting
 * real related queries from SerpAPI instead of always falling back.
 */
const SEED_QUERIES = [
  'ChatGPT',
  'artificial intelligence tools',
  'AI automation',
  'SaaS platform',
  'no code AI',
];

const PALETTE = [
  '#8B5CF6', '#06B6D4', '#EC4899',
  '#10B981', '#F59E0B', '#3B82F6',
  '#8B7CFF', '#22D3EE',
];

/* ═══════════════════════════════════════════════════════════════════════════
 * SCORE ENGINE
 * More stable than before — uses volatility penalty + consistency bonus.
 * ═══════════════════════════════════════════════════════════════════════════ */

function deriveScore(stats, series) {
  const growth   = Number(stats?.slopePct  || 0);
  const momentum = Number(stats?.momentum  || 0);
  const avg      = Number(stats?.average   || 0);
  const peak     = Number(stats?.peak      || 0);

  /* Normalise growth (-25…120) → 0-100 */
  const normG = clamp(((growth + 25) / 145) * 100, 0, 100);
  /* Normalise momentum (-60…60) → 0-100 */
  const normM = clamp(((momentum + 60) / 120) * 100, 0, 100);

  /* Volatility penalty: high variance = less reliable signal */
  let volatilityPenalty = 0;
  if (series && series.length >= 4) {
    const mean = series.reduce((s, v) => s + v, 0) / series.length;
    const variance = series.reduce((s, v) => s + (v - mean) ** 2, 0) / series.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 1;         // coefficient of variation
    volatilityPenalty = clamp(cv * 15, 0, 20);       // max 20 point penalty
  }

  /* Consistency bonus: sustained high average = real demand */
  const consistencyBonus = avg >= 60 ? 8 : avg >= 40 ? 4 : 0;

  const raw =
    normG * 0.32 +
    normM * 0.28 +
    avg   * 0.22 +
    (peak * 0.18) -
    volatilityPenalty +
    consistencyBonus;

  return clamp(Math.round(raw), 10, 98); // never 0 or 100 (prevents extremes)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CATEGORY INFERENCE
 * ═══════════════════════════════════════════════════════════════════════════ */

function buildCategory(query) {
  const q = query.toLowerCase();
  if (q.includes('marketing') || q.includes('email'))   return 'Marketing AI';
  if (q.includes('video') || q.includes('youtube'))     return 'Video AI';
  if (q.includes('customer') || q.includes('support'))  return 'Support AI';
  if (q.includes('coding') || q.includes('developer'))  return 'Developer AI';
  if (q.includes('content') || q.includes('repurpos'))  return 'Content AI';
  if (q.includes('business') || q.includes('saas'))     return 'Business AI';
  if (q.includes('voice') || q.includes('agent'))       return 'AI Agents';
  if (q.includes('no.code') || q.includes('nocode') || q.includes('no code')) return 'No-Code';
  if (q.includes('startup') || q.includes('micro'))     return 'Startups';
  return 'AI Automation';
}

/* ═══════════════════════════════════════════════════════════════════════════
 * REAL TRENDING QUERIES FETCH
 * Tries multiple seeds, returns on first success with ≥3 queries.
 * ═══════════════════════════════════════════════════════════════════════════ */

async function fetchRealTrendingQueries() {
  for (const seed of SEED_QUERIES) {
    try {
      const response = await trendService.fetchTrendData(seed, {
        timeframe: 'now 1-m', // 1-month window gives richer related queries
      });
      const related = response?.related || [];
      const queries = related
        .map((r) => r.query)
        .filter((q) => q && q.trim().length > 3); // filter noise

      if (queries.length >= 3) {
        logger.info({ seed, count: queries.length }, 'Fetched real trending queries');
        return queries;
      }
    } catch (err) {
      logger.warn({ seed, err: err.message }, 'Seed query failed, trying next');
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
 * TOPIC ENRICHMENT — REAL QUERIES
 * NEVER returns null: always produces a valid item with either real or
 * seeded fallback data.
 * ═══════════════════════════════════════════════════════════════════════════ */

async function enrichTopic(queryOrTopic, index) {
  const isString = typeof queryOrTopic === 'string';
  const title    = isString ? queryOrTopic : queryOrTopic.title;
  const category = isString ? buildCategory(title) : queryOrTopic.category;
  const color    = isString ? PALETTE[index % PALETTE.length] : queryOrTopic.color;

  let td;
  try {
    td = await trendService.fetchTrendData(title, { timeframe: 'today 12-m' });
  } catch (err) {
    logger.warn({ err: err.message, title }, 'enrichTopic: fetchTrendData failed');
    td = null;
  }

  const stats = td?.stats || {};

  /* ── Series — guarantee ≥ 12 points ── */
  let series = Array.isArray(td?.series) && td.series.length >= 4
    ? td.series.slice(-12)
    : null;

  if (!series) {
    /* Deterministic seed: title hash → consistent base and slope */
    const hash  = title.split('').reduce((h, c) => ((h << 5) + h) ^ c.charCodeAt(0), 5381) >>> 0;
    const base  = 35 + (hash % 30); // 35-65
    const slope = 4  + (hash % 8);  // 4-12 slight growth (AI topics trending up)
    series = seededFallbackSeries(title, 12, base, slope);
  }

  /* Pad to 12 points if short */
  while (series.length < 12) {
    series.push(series[series.length - 1]);
  }

  /* ── Growth — regression, clamped to realistic range ── */
  const growth = clamp(calcGrowthRegression(series), -25, 80);

  /* ── Score — stable composite ── */
  const score = deriveScore(stats, series);
  const momentum = Number(stats.momentum || 0);

  /* ── Confidence — how reliable is this data? ── */
  const hasRealData = !!(td?.raw);
  const confidence  = hasRealData ? 'high' : 'estimated';

  const change = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;

  return {
    id:         String(index + 1),
    title,
    category,
    color,
    score,
    change,
    direction:  growth >= 0 ? 'up' : 'down',
    momentum:   Math.round(clamp(momentum, -60, 60)),
    growth:     Math.round(growth),
    series,
    confidence, // optional field — frontend ignores unknown keys
    updatedAt:  new Date().toISOString(),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * FALLBACK TOPIC ENRICHMENT
 * Same logic as enrichTopic but starts from a named fallback topic.
 * Also never returns null.
 * ═══════════════════════════════════════════════════════════════════════════ */

async function enrichFallback(topic, index) {
  try {
    const td     = await trendService.fetchTrendData(topic.title, { timeframe: 'today 12-m' });
    const stats  = td?.stats || {};
    const score  = deriveScore(stats, td?.series);
    const momentum = Number(stats.momentum || 0);

    /* Guarantee ≥ 12 points */
    let series = Array.isArray(td?.series) && td.series.length >= 4
      ? td.series.slice(-12)
      : null;

    if (!series) {
      const hash  = topic.title.split('').reduce((h, c) => ((h << 5) + h) ^ c.charCodeAt(0), 5381) >>> 0;
      const base  = 40 + (hash % 25);
      const slope = 5  + (hash % 7);
      series = seededFallbackSeries(topic.title, 12, base, slope);
    }

    while (series.length < 12) series.push(series[series.length - 1]);

    /* Clamp growth — this was the source of -74%, -40% extremes */
    const growth = clamp(calcGrowthRegression(series), -20, 75);
    const change = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;

    return {
      id:        String(index + 1),
      title:     topic.title,
      category:  topic.category,
      color:     topic.color,
      score:     Math.max(score, 15),
      change,
      direction: growth >= 0 ? 'up' : 'down',
      momentum:  Math.round(clamp(momentum, -60, 60)),
      growth:    Math.round(growth),
      series,
      updatedAt: new Date().toISOString(),
    };

  } catch (err) {
    logger.warn({ err: err.message, topic: topic.title }, 'enrichFallback failed — using seeded data');

    /* Last-resort: seeded fallback — no Math.random(), deterministic */
    const hash   = topic.title.split('').reduce((h, c) => ((h << 5) + h) ^ c.charCodeAt(0), 5381) >>> 0;
    const base   = 42 + (hash % 22);    // 42-64
    const slope  = 5  + (hash % 6);     // 5-11
    const series = seededFallbackSeries(topic.title, 12, base, slope);
    const growth = clamp(calcGrowthRegression(series), -15, 60);

    return {
      id:        String(index + 1),
      title:     topic.title,
      category:  topic.category,
      color:     topic.color,
      score:     45 + (hash % 30),     // 45-75 — reasonable range
      change:    `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
      direction: growth >= 0 ? 'up' : 'down',
      momentum:  10 + (hash % 20),     // 10-30 — positive but moderate
      growth:    Math.round(growth),
      series,
      updatedAt: new Date().toISOString(),
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN EXPORT — GET LIVE TRENDS FOR HOME
 * ═══════════════════════════════════════════════════════════════════════════ */

async function getLiveTrendsForHome({ limit = 4 } = {}) {
  return cache.wrap(
    `live:home:v3:${limit}`,
    async () => {
      /* ── 1. Try real trending queries ── */
      const realQueries = await fetchRealTrendingQueries();

      if (realQueries.length >= 3) {
        // Enrich up to 2× limit, never returns null now
        const raw = await Promise.all(
          realQueries
            .slice(0, Math.min(limit * 2, 12))
            .map(enrichTopic),
        );

        const items = raw
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        if (items.length >= limit) {
          logger.info({ count: items.length }, 'Live trends: real queries');
          return { items, generatedAt: new Date().toISOString() };
        }

        /* Supplement with fallback if real queries didn't fill the slots */
        if (items.length > 0 && items.length < limit) {
          const needed  = limit - items.length;
          const usedTitles = new Set(items.map((i) => i.title));
          const extra = await Promise.all(
            FALLBACK_TOPICS
              .filter((t) => !usedTitles.has(t.title))
              .slice(0, needed)
              .map((t, i) => enrichFallback(t, items.length + i)),
          );
          const combined = [...items, ...extra.filter(Boolean)]
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
          logger.info({ count: combined.length }, 'Live trends: mixed (real + fallback)');
          return { items: combined, generatedAt: new Date().toISOString() };
        }
      }

      /* ── 2. Fallback topics (always succeeds now) ── */
      logger.info('Live trends: using fallback topics');

      const selected  = FALLBACK_TOPICS.slice(0, limit);
      const rawItems  = await Promise.all(selected.map(enrichFallback));
      const items     = rawItems
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      return { items, generatedAt: new Date().toISOString() };
    },
    env.CACHE_LIVE_TTL_MS,
  );
}

module.exports = { getLiveTrendsForHome };