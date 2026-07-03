
// 'use strict';

// const OpenAI = require('openai');
// const axios  = require('axios');
// const env    = require('../config/env');
// const logger = require('../config/logger');
// const { UpstreamError } = require('../utils/errors');

// const openai = new OpenAI({
//   apiKey:     env.OPENAI_API_KEY,
//   timeout:    env.AI_TIMEOUT_MS,
//   maxRetries: 1,
// });

// const groqHttp = axios.create({
//   baseURL: 'https://api.groq.com/openai/v1',
//   timeout: env.AI_TIMEOUT_MS,
//   headers: env.GROQ_API_KEY
//     ? { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }
//     : {},
// });

// /* ─────────────────────────────────────────────────────────────────────────────
//  * ANALYSIS PROMPT — unchanged
//  * ───────────────────────────────────────────────────────────────────────────── */

// const ANALYSIS_SYSTEM_PROMPT =
// `You are TrendValidator, a senior startup intelligence analyst.
// You analyze: Google Trends momentum, Reddit engagement, YouTube activity,
// competition intensity, market saturation, opportunity signals.

// IMPORTANT: Backend already calculates all metrics.
// DO NOT recalculate numbers, invent metrics, change scores, or contradict provided data.

// Generate: realistic duration, 4 concise insights, professional explanation.

// STYLE: sound like a human startup analyst, avoid robotic language, concise but strategic,
// practical insights only, no hype, no emojis.

// Return STRICT JSON ONLY:
// {
//   "duration": "<string>",
//   "insights": ["<string>","<string>","<string>","<string>"],
//   "explanation": "<2-4 concise professional sentences>"
// }`;

// /* ─────────────────────────────────────────────────────────────────────────────
//  * COMPETITOR SYSTEM PROMPT — UPDATED
//  *
//  * Previously: "SaaS market analyst" prompt that ignored marketplaces,
//  * communities, platforms, and API products → count:0 for "freelancing", etc.
//  *
//  * Now: category-agnostic product analyst that handles ALL competitor types:
//  * - SaaS tools and platforms
//  * - Marketplaces (Upwork, Fiverr, Etsy, etc.)
//  * - AI products and APIs
//  * - Developer tools and infrastructure
//  * - Community platforms
//  * - B2C and B2B apps
//  * ───────────────────────────────────────────────────────────────────────────── */

// const COMPETITOR_SYSTEM_PROMPT =
// `You are a product market intelligence analyst for a trend discovery platform.

// TASK: Identify the top competing products, platforms, services, or marketplaces for the given market query.

// INCLUDE ALL of these when relevant:
// - SaaS products and platforms
// - Online marketplaces (Upwork, Fiverr, Etsy, Freelancer.com, etc.)
// - AI tools, assistants, and APIs
// - Developer tools and infrastructure products
// - Community platforms and networks
// - Mobile apps and web apps
// - B2C and B2B products
// - Any product/service competing for the same user need or budget

// EXCLUDE strictly:
// - Blog posts, articles, listicles
// - Review/comparison/directory sites (G2, Capterra, etc.)
// - General news websites
// - Social media platforms (LinkedIn, Twitter) unless they ARE the product
// - Generic media/publishing companies

// IMPORTANT for marketplaces and platforms:
// - "freelancing" competitors INCLUDE Upwork, Fiverr, Toptal, Freelancer.com, PeoplePerHour
// - "AI tools" competitors INCLUDE ChatGPT, Claude, Jasper, Copy.ai, Writesonic
// - "e-commerce" competitors INCLUDE Shopify, WooCommerce, BigCommerce, Etsy
// - Be inclusive: when in doubt about a real product, include it

// For each competitor, provide:
// - name: product/company name (not a description)
// - website: homepage URL
// - domain: root domain (e.g. "upwork.com")
// - description: 1 sentence describing what this product does
// - popularity: 0-100 market presence estimate
// - position: "Leader" | "Challenger" | "Niche" | "New entrant"
// - pricing: "Free" | "Freemium" | "Low" | "Mid" | "Premium" | "Enterprise"
// - growthStatus: "Surging" | "Growing" | "Stable" | "Declining"
// - trafficBand: "high" | "mid" | "low"

// Return STRICT JSON ONLY — no markdown, no preamble:
// {
//   "competitors": [
//     {
//       "name": "<string>",
//       "website": "<string>",
//       "domain": "<string>",
//       "description": "<1 sentence>",
//       "popularity": <0-100>,
//       "position": "Leader|Challenger|Niche|New entrant",
//       "pricing": "Free|Freemium|Low|Mid|Premium|Enterprise",
//       "growthStatus": "Surging|Growing|Stable|Declining",
//       "trafficBand": "high|mid|low"
//     }
//   ]
// }`;

// /* ─────────────────────────────────────────────────────────────────────────────
//  * BUILD PROMPTS
//  * ───────────────────────────────────────────────────────────────────────────── */

// function buildAnalysisPrompt(query, trendData, sources, calculated) {
//   const stats   = trendData.stats || {};
//   const reddit  = sources?.reddit  || {};
//   const youtube = sources?.youtube || {};

//   return [
//     `QUERY: ${query}`, '',
//     'REAL MARKET METRICS:',
//     `- final score: ${calculated.score}`,
//     `- growth: ${calculated.growth}%`,
//     `- momentum: ${stats.momentum || 0}`,
//     `- market demand: ${calculated.marketDemand}`,
//     `- opportunity: ${calculated.opportunity}`,
//     `- competition: ${calculated.competitionLevel}`,
//     `- saturation: ${calculated.saturationLevel}`,
//     `- viral probability: ${calculated.viralProbability}`,
//     '', 'REDDIT SIGNALS:',
//     `- engagement score: ${reddit.engagementScore || 0}`,
//     `- posts: ${reddit.postCount || 0}`,
//     `- comments: ${reddit.totalComments || 0}`,
//     '', 'YOUTUBE SIGNALS:',
//     `- velocity score: ${youtube.velocityScore || 0}`,
//     `- videos: ${youtube.videoCount || 0}`,
//     `- total views: ${youtube.totalViews || 0}`,
//     '', 'ANALYSIS REQUIREMENTS:',
//     '- duration should reflect realistic trend lifespan',
//     '- insights must reference actual data',
//     '- explanation should sound like investor-grade analysis',
//     '- avoid repeating same metric multiple times',
//   ].join('\n');
// }

// /**
//  * Build competitor extraction prompt.
//  *
//  * @param {string} query           - search query
//  * @param {Array}  organicResults  - scored SERP organic results
//  * @param {string} [additionalCtx] - Reddit/YouTube/PH/related context (new)
//  */
// function buildCompetitorPrompt(query, organicResults, additionalCtx = '') {
//   const serpLines = (organicResults || [])
//     .slice(0, 18)
//     .map((r, i) => `${i + 1}. ${r.title} — ${r.link}${r.snippet ? `\n   ${r.snippet.slice(0, 100)}` : ''}`)
//     .join('\n');

//   return [
//     `MARKET QUERY: ${query}`,
//     '',
//     'SERP ORGANIC RESULTS (product pages, company sites):',
//     serpLines,
//     additionalCtx ? `\nADDITIONAL MARKET SIGNALS:${additionalCtx}` : '',
//     '',
//     `Extract the top competing products/platforms/marketplaces for "${query}".`,
//     'Use all signals above — SERP results AND the additional market signals.',
//     'Do NOT hallucinate products that are not implied by the data.',
//   ].filter(Boolean).join('\n');
// }

// /* ─────────────────────────────────────────────────────────────────────────────
//  * JSON PARSE HELPERS — unchanged
//  * ───────────────────────────────────────────────────────────────────────────── */

// function safeParseJSON(raw) {
//   if (!raw || typeof raw !== 'string') return null;
//   let s = raw.trim()
//     .replace(/^```(?:json)?\s*/i, '')
//     .replace(/\s*```$/i, '')
//     .trim();
//   try { return JSON.parse(s); } catch {}
//   const match = s.match(/\{[\s\S]*\}/);
//   if (match) { try { return JSON.parse(match[0]); } catch {} }
//   return null;
// }

// /* ─────────────────────────────────────────────────────────────────────────────
//  * LLM CALLERS — unchanged
//  * ───────────────────────────────────────────────────────────────────────────── */

// async function callOpenAI(system, user) {
//   const res = await openai.chat.completions.create({
//     model:           env.OPENAI_MODEL,
//     temperature:     0.4,
//     response_format: { type: 'json_object' },
//     messages:        [{ role: 'system', content: system }, { role: 'user', content: user }],
//   });
//   return safeParseJSON(res.choices?.[0]?.message?.content || '');
// }

// async function callGroq(system, user) {
//   if (!env.GROQ_API_KEY) throw new Error('Groq fallback not configured');
//   const { data } = await groqHttp.post('/chat/completions', {
//     model:           env.GROQ_MODEL,
//     temperature:     0.4,
//     response_format: { type: 'json_object' },
//     messages:        [{ role: 'system', content: system }, { role: 'user', content: user }],
//   });
//   return safeParseJSON(data?.choices?.[0]?.message?.content || '');
// }

// /* ─────────────────────────────────────────────────────────────────────────────
//  * PUBLIC API — unchanged signatures
//  * ───────────────────────────────────────────────────────────────────────────── */

// async function generateAnalysis(query, trendData, sources, calculated) {
//   const userPrompt = buildAnalysisPrompt(query, trendData, sources, calculated);

//   try {
//     const parsed = await callOpenAI(ANALYSIS_SYSTEM_PROMPT, userPrompt);
//     if (parsed) return { provider: 'openai', payload: parsed };
//     logger.warn({ query }, 'OpenAI invalid JSON');
//   } catch (err) {
//     logger.warn({ err: err.message, query }, 'OpenAI failed');
//   }

//   try {
//     const parsed = await callGroq(ANALYSIS_SYSTEM_PROMPT, userPrompt);
//     if (parsed) return { provider: 'groq', payload: parsed };
//     throw new Error('Groq invalid JSON');
//   } catch (err) {
//     logger.error({ err: err.message, query }, 'AI providers failed');
//     throw new UpstreamError('AI analysis unavailable', { cause: err.message });
//   }
// }

// /**
//  * Extract competitors using multi-source context.
//  *
//  * @param {string} query
//  * @param {Array}  organicResults  - SERP results from competitors.service
//  * @param {string} [additionalCtx] - Reddit/YouTube/PH context (optional, default '')
//  */
// async function extractCompetitors(query, organicResults, additionalCtx = '') {
//   const userPrompt = buildCompetitorPrompt(query, organicResults, additionalCtx);

//   try {
//     const parsed = await callOpenAI(COMPETITOR_SYSTEM_PROMPT, userPrompt);
//     if (parsed && Array.isArray(parsed.competitors)) return parsed.competitors;
//   } catch (err) {
//     logger.warn({ err: err.message, query }, 'OpenAI competitor extraction failed');
//   }

//   try {
//     const parsed = await callGroq(COMPETITOR_SYSTEM_PROMPT, userPrompt);
//     if (parsed && Array.isArray(parsed.competitors)) return parsed.competitors;
//   } catch (err) {
//     logger.warn({ err: err.message, query }, 'Groq competitor extraction failed');
//   }

//   return [];
// }

// module.exports = { generateAnalysis, extractCompetitors };





// src/services/ai.service.js
'use strict';

const OpenAI = require('openai');
const axios  = require('axios');
const env    = require('../config/env');
const logger = require('../config/logger');
const { UpstreamError } = require('../utils/errors');

const openai = new OpenAI({
  apiKey:     env.OPENAI_API_KEY,
  timeout:    env.AI_TIMEOUT_MS,
  maxRetries: 1,
});

const groqHttp = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  timeout: env.AI_TIMEOUT_MS,
  headers: env.GROQ_API_KEY
    ? { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }
    : {},
});

/* ─────────────────────────────────────────────────────────────────────────────
 * ANALYSIS PROMPT
 * ───────────────────────────────────────────────────────────────────────────── */

const ANALYSIS_SYSTEM_PROMPT =
`You are TrendValidator, a senior startup intelligence analyst.
You analyze: Google Trends momentum, Reddit engagement, YouTube activity,
competition intensity, market saturation, opportunity signals.

IMPORTANT: Backend already calculates all metrics.
DO NOT recalculate numbers, invent metrics, change scores, or contradict provided data.

Generate: realistic duration, 4 concise insights, professional explanation.

STYLE: sound like a human startup analyst, avoid robotic language, concise but strategic,
practical insights only, no hype, no emojis.

Return STRICT JSON ONLY:
{
  "duration": "<string>",
  "insights": ["<string>","<string>","<string>","<string>"],
  "explanation": "<2-4 concise professional sentences>"
}`;

/* ─────────────────────────────────────────────────────────────────────────────
 * COMPETITOR PROMPT
 * ───────────────────────────────────────────────────────────────────────────── */

const COMPETITOR_SYSTEM_PROMPT =
`You are a product market intelligence analyst for a trend discovery platform.

TASK: Identify the top competing products, platforms, services, or marketplaces for the given market query.

INCLUDE ALL of these when relevant:
- SaaS products and platforms
- Online marketplaces (Upwork, Fiverr, Etsy, Freelancer.com, etc.)
- AI tools, assistants, and APIs
- Developer tools and infrastructure products
- Community platforms and networks
- Mobile apps and web apps
- B2C and B2B products
- Any product/service competing for the same user need or budget

EXCLUDE strictly:
- Blog posts, articles, listicles
- Review/comparison/directory sites (G2, Capterra, etc.)
- General news websites
- Social media platforms (LinkedIn, Twitter) unless they ARE the product
- Generic media/publishing companies

IMPORTANT for marketplaces and platforms:
- "freelancing" competitors INCLUDE Upwork, Fiverr, Toptal, Freelancer.com, PeoplePerHour
- "AI tools" competitors INCLUDE ChatGPT, Claude, Jasper, Copy.ai, Writesonic
- "e-commerce" competitors INCLUDE Shopify, WooCommerce, BigCommerce, Etsy
- Be inclusive: when in doubt about a real product, include it

For each competitor, provide:
- name: product/company name (not a description)
- website: homepage URL
- domain: root domain (e.g. "upwork.com")
- description: 1 sentence describing what this product does
- popularity: 0-100 market presence estimate
- position: "Leader" | "Challenger" | "Niche" | "New entrant"
- pricing: "Free" | "Freemium" | "Low" | "Mid" | "Premium" | "Enterprise"
- growthStatus: "Surging" | "Growing" | "Stable" | "Declining"
- trafficBand: "high" | "mid" | "low"

Return STRICT JSON ONLY — no markdown, no preamble:
{
  "competitors": [
    {
      "name": "<string>",
      "website": "<string>",
      "domain": "<string>",
      "description": "<1 sentence>",
      "popularity": <0-100>,
      "position": "Leader|Challenger|Niche|New entrant",
      "pricing": "Free|Freemium|Low|Mid|Premium|Enterprise",
      "growthStatus": "Surging|Growing|Stable|Declining",
      "trafficBand": "high|mid|low"
    }
  ]
}`;

/* ─────────────────────────────────────────────────────────────────────────────
 * IDEA GENERATION PROMPT
 * ───────────────────────────────────────────────────────────────────────────── */

const IDEA_SYSTEM_PROMPT =
`You are TrendValidator's startup ideation engine. Given a market keyword and
real market signals (Google Trends, Reddit engagement, YouTube activity,
existing competitors), generate exactly 10 distinct, actionable business or
product ideas within that market.

RULES:
- Each idea must be a genuinely different angle, sub-segment, or product type — no near-duplicates.
- Ground demandScore and competitionScore in the provided real signals; do not invent numbers disconnected from the data.
- audience: a specific buyer persona, not "everyone".
- monetization: a concrete revenue model (subscription, commission, one-time, ads, freemium, marketplace fee, etc.), not generic "make money".
- No hype, no emojis, no filler language.

Return STRICT JSON ONLY — no markdown, no preamble:
{
  "ideas": [
    {
      "title": "<string>",
      "description": "<1-2 sentences>",
      "audience": "<specific buyer persona>",
      "monetization": "<concrete revenue model>",
      "demandScore": <0-100>,
      "competitionScore": <0-100>
    }
  ]
}
Generate exactly 10 ideas.`;

/* ─────────────────────────────────────────────────────────────────────────────
 * NICHE DISCOVERY PROMPT
 * ───────────────────────────────────────────────────────────────────────────── */

const NICHE_SYSTEM_PROMPT =
`You are TrendValidator's niche discovery engine. Given a broad market keyword
and real market signals, identify exactly 10 specific niche sub-segments
within that market — narrower, more targetable slices with their own
distinct audience and positioning.

RULES:
- Each niche must be meaningfully narrower than the parent keyword (a sub-vertical, audience segment, use-case, or geography-specific angle), not a rephrasing of the keyword itself.
- score: overall niche viability (0-100), weighing demand against competition and opportunity.
- demand, competition, opportunity: ground these in the provided real signals; do not invent disconnected numbers.
- No hype, no emojis, no filler.

Return STRICT JSON ONLY — no markdown, no preamble:
{
  "niches": [
    {
      "niche": "<string>",
      "score": <0-100>,
      "demand": <0-100>,
      "competition": <0-100>,
      "opportunity": <0-100>
    }
  ]
}
Generate exactly 10 niches.`;

/* ─────────────────────────────────────────────────────────────────────────────
 * BUILD PROMPTS
 * ───────────────────────────────────────────────────────────────────────────── */

function buildAnalysisPrompt(query, trendData, sources, calculated) {
  const stats   = trendData.stats || {};
  const reddit  = sources?.reddit  || {};
  const youtube = sources?.youtube || {};

  return [
    `QUERY: ${query}`, '',
    'REAL MARKET METRICS:',
    `- final score: ${calculated.score}`,
    `- growth: ${calculated.growth}%`,
    `- momentum: ${stats.momentum || 0}`,
    `- market demand: ${calculated.marketDemand}`,
    `- opportunity: ${calculated.opportunity}`,
    `- competition: ${calculated.competitionLevel}`,
    `- saturation: ${calculated.saturationLevel}`,
    `- viral probability: ${calculated.viralProbability}`,
    '', 'REDDIT SIGNALS:',
    `- engagement score: ${reddit.engagementScore || 0}`,
    `- posts: ${reddit.postCount || 0}`,
    `- comments: ${reddit.totalComments || 0}`,
    '', 'YOUTUBE SIGNALS:',
    `- velocity score: ${youtube.velocityScore || 0}`,
    `- videos: ${youtube.videoCount || 0}`,
    `- total views: ${youtube.totalViews || 0}`,
    '', 'ANALYSIS REQUIREMENTS:',
    '- duration should reflect realistic trend lifespan',
    '- insights must reference actual data',
    '- explanation should sound like investor-grade analysis',
    '- avoid repeating same metric multiple times',
  ].join('\n');
}

function buildCompetitorPrompt(query, organicResults, additionalCtx = '') {
  const serpLines = (organicResults || [])
    .slice(0, 18)
    .map((r, i) => `${i + 1}. ${r.title} — ${r.link}${r.snippet ? `\n   ${r.snippet.slice(0, 100)}` : ''}`)
    .join('\n');

  return [
    `MARKET QUERY: ${query}`,
    '',
    'SERP ORGANIC RESULTS (product pages, company sites):',
    serpLines,
    additionalCtx ? `\nADDITIONAL MARKET SIGNALS:${additionalCtx}` : '',
    '',
    `Extract the top competing products/platforms/marketplaces for "${query}".`,
    'Use all signals above — SERP results AND the additional market signals.',
    'Do NOT hallucinate products that are not implied by the data.',
  ].filter(Boolean).join('\n');
}

/** Shared context builder for idea + niche prompts — same signal shape. */
function buildSignalContext(query, trendData, sources, competitors) {
  const stats   = trendData.stats || {};
  const reddit  = sources?.reddit  || {};
  const youtube = sources?.youtube || {};

  const competitorLines = (competitors || [])
    .slice(0, 8)
    .map((c) => `- ${c.name} (${c.position || 'Challenger'}, popularity ${c.popularity || 0})`)
    .join('\n') || 'No major competitors found.';

  return [
    `- Google Trends growth: ${stats.slopePct || 0}%`,
    `- momentum: ${stats.momentum || 0}`,
    `- Reddit engagement score: ${reddit.engagementScore || 0} (${reddit.postCount || 0} posts)`,
    `- YouTube velocity score: ${youtube.velocityScore || 0} (${youtube.videoCount || 0} videos)`,
    '', 'EXISTING COMPETITORS:',
    competitorLines,
  ].join('\n');
}

function buildIdeaPrompt(query, trendData, sources, competitors) {
  return [
    `MARKET KEYWORD: ${query}`, '',
    'REAL MARKET SIGNALS:',
    buildSignalContext(query, trendData, sources, competitors),
    '', `Generate exactly 10 distinct business/product ideas for "${query}", grounded in the signals above.`,
  ].join('\n');
}

function buildNichePrompt(query, trendData, sources, competitors) {
  return [
    `PARENT MARKET: ${query}`, '',
    'REAL MARKET SIGNALS:',
    buildSignalContext(query, trendData, sources, competitors),
    '', `Identify exactly 10 niche sub-segments within "${query}", grounded in the signals above.`,
  ].join('\n');
}

/* ─────────────────────────────────────────────────────────────────────────────
 * JSON PARSE HELPERS
 * ───────────────────────────────────────────────────────────────────────────── */

function safeParseJSON(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let s = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try { return JSON.parse(s); } catch {}
  const match = s.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * LLM CALLERS
 * ───────────────────────────────────────────────────────────────────────────── */

async function callOpenAI(system, user) {
  const res = await openai.chat.completions.create({
    model:           env.OPENAI_MODEL,
    temperature:     0.4,
    response_format: { type: 'json_object' },
    messages:        [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  return safeParseJSON(res.choices?.[0]?.message?.content || '');
}

async function callGroq(system, user) {
  if (!env.GROQ_API_KEY) throw new Error('Groq fallback not configured');
  const { data } = await groqHttp.post('/chat/completions', {
    model:           env.GROQ_MODEL,
    temperature:     0.4,
    response_format: { type: 'json_object' },
    messages:        [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  return safeParseJSON(data?.choices?.[0]?.message?.content || '');
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PUBLIC API
 * ───────────────────────────────────────────────────────────────────────────── */

async function generateAnalysis(query, trendData, sources, calculated) {
  const userPrompt = buildAnalysisPrompt(query, trendData, sources, calculated);

  try {
    const parsed = await callOpenAI(ANALYSIS_SYSTEM_PROMPT, userPrompt);
    if (parsed) return { provider: 'openai', payload: parsed };
    logger.warn({ query }, 'OpenAI invalid JSON');
  } catch (err) {
    logger.warn({ err: err.message, query }, 'OpenAI failed');
  }

  try {
    const parsed = await callGroq(ANALYSIS_SYSTEM_PROMPT, userPrompt);
    if (parsed) return { provider: 'groq', payload: parsed };
    throw new Error('Groq invalid JSON');
  } catch (err) {
    logger.error({ err: err.message, query }, 'AI providers failed');
    throw new UpstreamError('AI analysis unavailable', { cause: err.message });
  }
}

async function extractCompetitors(query, organicResults, additionalCtx = '') {
  const userPrompt = buildCompetitorPrompt(query, organicResults, additionalCtx);

  try {
    const parsed = await callOpenAI(COMPETITOR_SYSTEM_PROMPT, userPrompt);
    if (parsed && Array.isArray(parsed.competitors)) return parsed.competitors;
  } catch (err) {
    logger.warn({ err: err.message, query }, 'OpenAI competitor extraction failed');
  }

  try {
    const parsed = await callGroq(COMPETITOR_SYSTEM_PROMPT, userPrompt);
    if (parsed && Array.isArray(parsed.competitors)) return parsed.competitors;
  } catch (err) {
    logger.warn({ err: err.message, query }, 'Groq competitor extraction failed');
  }

  return [];
}

/** Generate Idea. Throws UpstreamError if both providers fail (no fake ideas). */
async function generateIdeas(query, trendData, sources, competitors) {
  const userPrompt = buildIdeaPrompt(query, trendData, sources, competitors);

  try {
    const parsed = await callOpenAI(IDEA_SYSTEM_PROMPT, userPrompt);
    if (parsed && Array.isArray(parsed.ideas)) return parsed.ideas;
  } catch (err) {
    logger.warn({ err: err.message, query }, 'OpenAI idea generation failed');
  }

  try {
    const parsed = await callGroq(IDEA_SYSTEM_PROMPT, userPrompt);
    if (parsed && Array.isArray(parsed.ideas)) return parsed.ideas;
    throw new Error('Groq invalid JSON');
  } catch (err) {
    logger.error({ err: err.message, query }, 'Idea generation: both AI providers failed');
    throw new UpstreamError('Idea generation unavailable', { cause: err.message });
  }
}

/** Niche Finder. Throws UpstreamError if both providers fail (no fake niches). */
async function generateNiches(query, trendData, sources, competitors) {
  const userPrompt = buildNichePrompt(query, trendData, sources, competitors);

  try {
    const parsed = await callOpenAI(NICHE_SYSTEM_PROMPT, userPrompt);
    if (parsed && Array.isArray(parsed.niches)) return parsed.niches;
  } catch (err) {
    logger.warn({ err: err.message, query }, 'OpenAI niche generation failed');
  }

  try {
    const parsed = await callGroq(NICHE_SYSTEM_PROMPT, userPrompt);
    if (parsed && Array.isArray(parsed.niches)) return parsed.niches;
    throw new Error('Groq invalid JSON');
  } catch (err) {
    logger.error({ err: err.message, query }, 'Niche generation: both AI providers failed');
    throw new UpstreamError('Niche generation unavailable', { cause: err.message });
  }
}

module.exports = {
  generateAnalysis,
  extractCompetitors,
  generateIdeas,
  generateNiches,
};
