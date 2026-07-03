// backend/src/services/sources/producthunt.js
'use strict';

const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../config/logger');
const TTLCache = require('../../utils/cache');

const cache = new TTLCache({ max: 200 });

/**
 * Product Hunt's free API doesn't expose a great keyword-search endpoint.
 * We use SerpAPI `site:producthunt.com <query>` which returns real PH product
 * pages matching the query. Honest, real data.
 */
async function fetchProductHuntSignal(query) {
  return cache.wrap(`producthunt:${query}`, async () => {
    try {
      const { data } = await axios.get('https://serpapi.com/search.json', {
        params: { engine: 'google', q: `site:producthunt.com ${query}`, num: 10, api_key: env.SERPAPI_KEY },
        timeout: env.SERPAPI_TIMEOUT_MS,
      });
      const results = data?.organic_results || [];
      const products = results.map((r) => ({
        name: cleanProductName(r.title),
        url: r.link,
        snippet: r.snippet || '',
      })).filter((p) => p.name);
      return { source: 'producthunt', query, productCount: products.length, topProducts: products.slice(0, 5) };
    } catch (err) {
      logger.warn({ err: err.message, query }, 'Product Hunt search failed');
      return { source: 'producthunt', query, error: err.message, productCount: 0, topProducts: [] };
    }
  }, env.CACHE_TRENDS_TTL_MS);
}

function cleanProductName(title) {
  if (!title) return '';
  return title.replace(/\s*[-–|]\s*Product Hunt.*$/i, '').replace(/\s*\|\s*.*$/, '').trim();
}

module.exports = { fetchProductHuntSignal };