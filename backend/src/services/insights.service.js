// src/services/insights.service.js
'use strict';

const axios               = require('axios');
const env                  = require('../config/env');
const logger                 = require('../config/logger');
const trendService            = require('./trend.service');
const competitorsService       = require('./competitors.service');
const TTLCache                  = require('../utils/cache');

const cache = new TTLCache({ max: 150 });

/* Kept in sync with analyze.service.calcSearchVolume — same formula,
 * same source metric (Google Trends "average interest"). Do not diverge. */
function calcSearchVolume(avg) {
  return Math.max(100, Math.round(Number(avg) * 1400));
}

/**
 * Real Google Trends region breakdown via SerpAPI (data_type=GEO_MAP_0).
 * No mock data: on failure, returns an empty array — the screen shows a
 * real empty state, never a synthetic country list.
 */
async function fetchTopCountries(query, geo) {
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine:    'google_trends',
        q:         query,
        data_type: 'GEO_MAP_0',
        geo:       geo || '',
        api_key:   env.SERPAPI_KEY,
      },
      timeout: env.SERPAPI_TIMEOUT_MS,
    });

    const regions = data?.interest_by_region || [];
    return regions
      .filter((r) => Number(r.extracted_value ?? r.value ?? 0) > 0)
      .sort((a, b) => (b.extracted_value ?? b.value ?? 0) - (a.extracted_value ?? a.value ?? 0))
      .slice(0, 10)
      .map((r) => ({
        country: r.geoName || r.location || 'Unknown',
        value:   Number(r.extracted_value ?? r.value ?? 0),
      }));
  } catch (err) {
    logger.warn({ err: err.message, query }, 'insights.service: region fetch failed');
    return [];
  }
}

/**
 * Competition band derived from real competitor count + average popularity
 * (competitorsService.findCompetitors is the same cached real pipeline
 * used by /api/analyze — no separate logic invented here).
 */
function deriveCompetitionBand(competitors) {
  if (!competitors.length) return 'Low';
  const avgPop = competitors.reduce((s, c) => s + Number(c.popularity || 0), 0) / competitors.length;
  if (avgPop >= 70 || competitors.length >= 7) return 'High';
  if (avgPop >= 45 || competitors.length >= 4) return 'Medium';
  return 'Low';
}

/**
 * Market Insights — derived entirely from real signals already wired into
 * this codebase. No OpenAI call: no LLM cost, no hallucination risk, no
 * credit charge (free for any authenticated user).
 */
async function getMarketInsights(query, { geo, timeframe } = {}) {
  const cacheKey = `insights:${query.toLowerCase().trim()}:${geo || ''}`;

  return cache.wrap(cacheKey, async () => {
    const [trendData, competitors, topCountries] = await Promise.all([
      trendService.fetchTrendData(query, { geo, timeframe }),
      competitorsService.findCompetitors(query),
      fetchTopCountries(query, geo),
    ]);

    const stats = trendData.stats || {};

    return {
      growthRate:        Number(stats.slopePct  || 0),
      searchVolume:        calcSearchVolume(stats.average || 0),
      competition:          deriveCompetitionBand(competitors),
      topCountries,
      topRelatedQueries:    (trendData.related || [])
        .map((r) => r.query || r.topic?.title || '')
        .filter(Boolean)
        .slice(0, 10),
      momentumScore:        Number(stats.momentum || 0),
    };
  }, env.CACHE_TRENDS_TTL_MS);
}

module.exports = { getMarketInsights };
