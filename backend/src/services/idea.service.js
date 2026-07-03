// src/services/idea.service.js
'use strict';

const trendService           = require('./trend.service');
const { fetchRedditSignal }  = require('./sources/reddit');
const { fetchYouTubeSignal } = require('./sources/youtube');
const competitorsService     = require('./competitors.service');
const aiService               = require('./ai.service');
const creditService            = require('./credit.service');
const TTLCache                  = require('../utils/cache');
const env                        = require('../config/env');
const logger                      = require('../config/logger');

const cache = new TTLCache({ max: 100 });
const IDEA_COUNT = 10;

function clampScore(n, fallback = 50) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : fallback;
}

function normalizeIdea(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = String(raw.title || '').trim();
  if (!title) return null;

  return {
    title:            title.slice(0, 120),
    description:      String(raw.description   || '').trim().slice(0, 400),
    audience:         String(raw.audience       || '').trim().slice(0, 200),
    monetization:     String(raw.monetization   || '').trim().slice(0, 200),
    demandScore:      clampScore(raw.demandScore),
    competitionScore: clampScore(raw.competitionScore),
  };
}

/**
 * Generate AI-powered business ideas for a keyword, grounded in real
 * Google Trends + Reddit + YouTube + competitor signals (same sources
 * /api/analyze uses). No mock data: if both AI providers fail, throws
 * UpstreamError (502) and the reserved credit is refunded — no fake
 * ideas are ever fabricated to "fill" the response to 10.
 *
 * Credit cost: same as /api/analyze (env.ANALYZE_COST) since this calls
 * the same paid OpenAI/Groq providers. Cache hits within the TTL window
 * are NOT charged — only a real AI call costs a credit.
 */
async function generateIdeas(uid, query) {
  const cacheKey = `ideas:${query.toLowerCase().trim()}`;
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
    const raw = await aiService.generateIdeas(query, trendData, sources, competitors);

    const ideas = (Array.isArray(raw) ? raw : [])
      .map(normalizeIdea)
      .filter(Boolean)
      .slice(0, IDEA_COUNT);

    if (ideas.length < IDEA_COUNT) {
      logger.warn(
        { query, count: ideas.length },
        'idea.service: AI returned fewer than 10 ideas — returning as-is, no fabricated padding',
      );
    }

    const result = { ideas, _meta: { creditsRemaining: reservation.remaining } };
    cache.set(cacheKey, result, env.CACHE_TRENDS_TTL_MS);

    await creditService.settle(uid);
    return result;

  } catch (err) {
    await creditService.refund(uid, env.ANALYZE_COST, err.code || 'idea_pipeline_error');
    throw err;
  }
}

module.exports = { generateIdeas };
