// src/services/niche.service.js
'use strict';

const trendService           = require('./trend.service');
const { fetchRedditSignal }  = require('./sources/reddit');
const { fetchYouTubeSignal } = require('./sources/youtube');
const competitorsService     = require('./competitors.service');
const aiService                = require('./ai.service');
const creditService             = require('./credit.service');
const TTLCache                   = require('../utils/cache');
const env                         = require('../config/env');
const logger                       = require('../config/logger');

const cache = new TTLCache({ max: 100 });
const NICHE_COUNT = 10;

function clampScore(n, fallback = 50) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : fallback;
}

function normalizeNiche(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const niche = String(raw.niche || '').trim();
  if (!niche) return null;

  return {
    niche:        niche.slice(0, 120),
    score:        clampScore(raw.score),
    demand:       clampScore(raw.demand),
    competition:  clampScore(raw.competition),
    opportunity:  clampScore(raw.opportunity),
  };
}

/**
 * Discover niche sub-segments inside a broader market, grounded in the
 * same real Google Trends + Reddit + YouTube + competitor signals as
 * Generate Idea. Same credit/cache contract as idea.service.
 */
async function findNiches(uid, query) {
  const cacheKey = `niches:${query.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const reservation = await creditService.reserve(uid, env.ANALYZE_COST);

  try {
    const [trendData, redditData, youtubeData, competitors] = await Promise.all([
      trendService.fetchTrendData(query),
      fetchRedditSignal(query),
      fetchYouTubeSignal(query),
      competitorsService.findCompetitors(query),
    ]);

    const sources = { reddit: redditData, youtube: youtubeData };
    const raw = await aiService.generateNiches(query, trendData, sources, competitors);

    const niches = (Array.isArray(raw) ? raw : [])
      .map(normalizeNiche)
      .filter(Boolean)
      .slice(0, NICHE_COUNT);

    if (niches.length < NICHE_COUNT) {
      logger.warn(
        { query, count: niches.length },
        'niche.service: AI returned fewer than 10 niches — returning as-is, no fabricated padding',
      );
    }

    const result = { niches, _meta: { creditsRemaining: reservation.remaining } };
    cache.set(cacheKey, result, env.CACHE_TRENDS_TTL_MS);

    await creditService.settle(uid);
    return result;

  } catch (err) {
    await creditService.refund(uid, env.ANALYZE_COST, err.code || 'niche_pipeline_error');
    throw err;
  }
}

module.exports = { findNiches };
