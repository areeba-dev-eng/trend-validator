// // backend/src/services/competitors.service.js
// 'use strict';

// const axios     = require('axios');
// const env       = require('../config/env');
// const logger    = require('../config/logger');
// const aiService = require('./ai.service');
// const TTLCache  = require('../utils/cache');

// const cache = new TTLCache({ max: 200 });

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * BLOCKED DOMAINS
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const BLOCKED_DOMAINS = new Set([
//   // Review / aggregator sites
//   'g2.com','capterra.com','getapp.com','softwareadvice.com','trustpilot.com',
//   'trustradius.com','gartner.com','alternativeto.net','slashdot.org',
//   'sourceforge.net','saashub.com','stackshare.io','getlatka.com',
//   'crozdesk.com','siftery.com','featuredcustomers.com','financesonline.com',
//   'serchen.com','appvizer.com','toolbox.com','there4.io',
//   // App stores
//   'apps.microsoft.com','play.google.com','apps.apple.com',
//   'chrome.google.com','addons.mozilla.org','marketplace.atlassian.com',
//   'extensions.gnome.org','app.appstore.com',
//   // Social / content platforms
//   'linkedin.com','facebook.com','instagram.com','twitter.com','x.com',
//   'tiktok.com','youtube.com','pinterest.com','reddit.com','quora.com',
//   'medium.com','substack.com','blogger.com','tumblr.com','dev.to',
//   'hashnode.com','ghost.io','wordpress.com','wix.com','squarespace.com',
//   // News / encyclopedias
//   'wikipedia.org','techcrunch.com','forbes.com','inc.com','wired.com',
//   'theverge.com','mashable.com','venturebeat.com','businessinsider.com',
//   'zdnet.com','cnet.com','engadget.com','entrepreneur.com','pcmag.com',
//   'tomsguide.com','digitaltrends.com','techradar.com','makeuseof.com',
//   'howtogeek.com','lifewire.com','tomsguide.com','readwrite.com',
//   // Directories / indexes
//   'producthunt.com','crunchbase.com','angellist.com','appsumo.com',
//   'zapier.com','ifttt.com','make.com','featurelist.com','clutch.co',
//   'goodfirms.co','designrush.com','sortlist.com','bark.com',
//   // E-commerce / job sites
//   'amazon.com','ebay.com','etsy.com','shopify.com','upwork.com',
//   'fiverr.com','indeed.com','glassdoor.com','app.co','toptal.com',
//   // Content / blog platforms
//   'docs.google.com','gitbook.com','confluence.atlassian.com',
//   'help.openai.com','support.google.com','learn.microsoft.com',
//   // Known SEO / content farm patterns
//   'wildnetedge.com','agencyanalytics.com','semrush.com','ahrefs.com',
//   'moz.com','searchengineland.com','searchenginejournal.com',
//   'neilpatel.com','backlinko.com','hubspot.com','contentmarketinginstitute.com',
//   'smartblogger.com','copyblogger.com','problogger.net',
// ]);

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * TRUSTED / BOOSTED DOMAINS (high-quality real products)
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const TRUSTED_DOMAINS = new Set([
//   'openai.com','anthropic.com','perplexity.ai','jasper.ai','canva.com',
//   'runwayml.com','midjourney.com','figma.com','notion.so','airtable.com',
//   'monday.com','clickup.com','linear.app','vercel.com','supabase.com',
//   'github.com','gitlab.com','stripe.com','twilio.com','sendgrid.com',
//   'intercom.com','zendesk.com','freshdesk.com','hubspot.com','salesforce.com',
//   'typeform.com','calendly.com','loom.com','miro.com','whimsical.com',
//   'asana.com','trello.com','basecamp.com','slack.com','discord.com',
//   'zoom.us','webex.com','meet.google.com','teams.microsoft.com',
//   'adobe.com','sketch.com','invisionapp.com','zeplin.io','abstract.com',
//   'writesonic.com','copy.ai','rytr.me','wordtune.com','grammarly.com',
//   'otter.ai','descript.com','synthesia.io','heygen.com','pictory.ai',
//   'murf.ai','elevenlabs.io','play.ht','assemblyai.com','deepgram.com',
//   'huggingface.co','replicate.com','stability.ai','character.ai',
//   'cohere.com','ai21.com','together.ai','mistral.ai','groq.com',
//   'pinecone.io','weaviate.io','qdrant.tech','chroma.com',
//   'langchain.com','llamaindex.ai','flowise.ai','n8n.io','activepieces.com',
// ]);

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * TITLE / SNIPPET GARBAGE PATTERNS
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const TITLE_GARBAGE_RE = [
//   /\bbest\b/i, /\btop\s*\d*\b/i, /\bpopular\b/i,
//   /\bapps?\s+for\b/i, /\balternatives?\b/i, /\bexamples?\b/i,
//   /\bguide\b/i, /\bhow\s+to\b/i, /\bcomparison\b/i,
//   /\bvs\.?\b/i, /\blist[s]?\b/i, /\bdirector(y|ies)\b/i,
//   /\btemplate[s]?\b/i, /\bblog[s]?\b/i, /\barticle[s]?\b/i,
//   /\btutorial[s]?\b/i, /\buse\s+cases?\b/i, /\btools?\b/i,
//   /\breviews?\b/i, /\bcompanies\s+that\s+use\b/i,
//   /\bcustomer\s+list\b/i, /\bwho\s+owns\b/i, /\bwhat\s+is\b/i,
//   /\bcomprehensive\b/i, /\bcurated\b/i, /\bcomplete\b/i,
//   /\bultimate\b/i, /\b20[0-9]{2}\b/, /\bfree\s+(trial|tools?|apps?)\b/i,
//   /\bmost\s+(popular|used|powerful)\b/i,
// ];

// const BAD_TITLE_PATTERNS = [
//   /\bplans?\b/i,
//   /\bpricing\b/i,
//   /\bplatforms?\b/i,
//   /\baccelerate\b/i,
//   /\bbusiness\b/i,
//   /\bfeatures?\b/i,
//   /\btemplates?\b/i,
//   /\bprompts?\b/i,
//   /\bresources?\b/i,
//   /\bsolutions?\b/i,
//   /\bservices?\b/i,
// ];

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * SNIPPET GARBAGE PATTERNS  (weaker signal — used to downrank, not hard-block)
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const SNIPPET_GARBAGE_RE = [
//   /top\s+\d+/i, /best\s+\d+/i, /\bwe've\s+compiled\b/i,
//   /\bour\s+list\b/i, /\bhere\s+are\b/i, /\bcheck\s+out\b/i,
//   /\bin\s+this\s+(article|guide|post|blog)\b/i,
//   /\bcomprehensive\s+(guide|list|review)\b/i,
// ];

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * URL PATH BLACKLIST
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const BLOCKED_PATHS = [
//   '/blog/', '/news/', '/article/', '/articles/', '/top/', '/best/',
//   '/guide/', '/guides/', '/resources/', '/learn/', '/help/', '/docs/',
//   '/category/', '/tag/', '/tags/', '/press/', '/about/', '/careers/',
//   '/tips/', '/tutorial/', '/tutorials/', '/insights/', '/research/',
//   '/report/', '/reports/', '/whitepaper/', '/ebook/', '/case-study/',
// ];

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * DOMAIN PATTERN BLACKLIST (catches agency / SEO / content farm patterns)
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const DOMAIN_PATTERN_BLOCKLIST = [
//   /agency/i, /seo/i, /marketing/i, /digital/i,
//   /blog/i, /news/i, /media/i, /content/i, /article/i,
//   /review/i, /compare/i, /ranked/i, /listing/i, /directory/i,
//   /solution[s]?/i, /consult/i, /services?/i, /expert[s]?/i,
// ];

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * POSITIVE SIGNALS — domains/snippets that suggest a real product
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const PRODUCT_SIGNALS_RE = [
//   /\bpric(e|ing)\b/i, /\bsign\s+up\b/i, /\bget\s+started\b/i,
//   /\bfree\s+(plan|tier|account)\b/i, /\bapi\b/i, /\bintegrat/i,
//   /\bdashboard\b/i, /\bworkspace\b/i, /\bplatform\b/i,
//   /\bpowered\s+by\s+ai\b/i, /\bai-powered\b/i, /\bautomation\b/i,
//   /\bno[\s-]code\b/i, /\blow[\s-]code\b/i, /\bsaas\b/i,
// ];

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * HELPERS
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// function extractDomain(url) {
//   try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); }
//   catch { return null; }
// }

// function getRootDomain(domain) {
//   if (!domain) return '';
//   const d = String(domain).toLowerCase();
//   const parts = d.split('.');
//   if (parts.length <= 2) return d;
//   const sld = parts[parts.length - 2];
//   const tld = parts[parts.length - 1];
//   const is3Part = ['co','com','org','net','gov','edu','ac'].includes(sld) && tld.length === 2;
//   return is3Part ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
// }

// function isHardBlocked(domain) {
//   if (!domain) return true;
//   const d    = String(domain).toLowerCase();
//   const root = getRootDomain(d);
//   return BLOCKED_DOMAINS.has(d) || BLOCKED_DOMAINS.has(root);
// }

// function hasDomainAgencyPattern(domain) {
//   // Reject domains that look like agencies, SEO firms, or content farms
//   const d = String(domain).toLowerCase();
//   // Allow known SaaS TLDs (.ai, .io, .app, .dev) — these are nearly always real products
//   if (/\.(ai|io|app|dev|so|co|tech|tools?)$/.test(d)) return false;
//   return DOMAIN_PATTERN_BLOCKLIST.some((re) => re.test(d.replace(/\.(com|org|net|io|ai|co)$/, '')));
// }

// function hasBlockedPath(url) {
//   try {
//     const path = new URL(url).pathname.toLowerCase();
//     return BLOCKED_PATHS.some((p) => path.includes(p));
//   } catch { return false; }
// }

// function isGarbageTitle(title) {
//   return TITLE_GARBAGE_RE.some((re) => re.test(String(title)));
// }

// function snippetLooksGarbage(snippet) {
//   if (!snippet) return false;
//   return SNIPPET_GARBAGE_RE.some((re) => re.test(String(snippet)));
// }

// function hasProductSignal(title, snippet) {
//   const text = `${title} ${snippet}`;
//   return PRODUCT_SIGNALS_RE.some((re) => re.test(text));
// }

// function cleanBrandName(raw = '') {
//   return String(raw)
//     .replace(/\b(best|top|review|comparison|alternative[s]?|vs|guide|free|online|tool[s]?|software|platform|saas|ai|app|20\d{2}|popular|curated)\b/gi, '')
//     .replace(/[^\w\s.-]/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim()
//     .slice(0, 50);
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * SCORING — determines quality of a search result as a competitor candidate
//  * Higher = better. Results below threshold are rejected or used only as fallback.
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// const SCORE_THRESHOLD = -5; // entries below this are dropped entirely

// function scoreResult(r) {
//   let score = 0;
//   const root = getRootDomain(r.domain);

//   // Trusted known-product domains get a big boost
//   if (TRUSTED_DOMAINS.has(root) || TRUSTED_DOMAINS.has(r.domain)) score += 40;

//   // Likely-product TLDs
//   if (/\.(ai|io|app|dev|so|tech)$/.test(r.domain)) score += 15;

//   // Homepage / pricing preferred over content pages
//   try {
//     const path = new URL(r.link).pathname.replace(/\/$/, '');
//     if (path === '' || path === '/pricing' || path === '/features') score += 10;
//     if (path.startsWith('/product') || path.startsWith('/solutions')) score += 5;
//   } catch {}

//   // Positive product signals in snippet
//   if (hasProductSignal(r.title, r.snippet)) score += 12;

//   // Penalize garbage snippets
//   if (snippetLooksGarbage(r.snippet)) score -= 15;

//   // Penalize high position (lower ranked = less authoritative)
//   score -= Math.floor((r.position - 1) * 2);

//   // Penalize suspicious domain patterns
//   if (hasDomainAgencyPattern(r.domain)) score -= 20;

//   return score;
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * SERPAPI SEARCH
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// async function serpSearch(q, num = 15) {
//   try {
//     const { data } = await axios.get('https://serpapi.com/search.json', {
//       params: { engine: 'google', q, num, api_key: env.SERPAPI_KEY },
//       timeout: env.SERPAPI_TIMEOUT_MS,
//     });

//     return (data?.organic_results || [])
//       .map((r) => ({
//         title:    r.title    || '',
//         link:     r.link     || '',
//         snippet:  r.snippet  || '',
//         domain:   extractDomain(r.link),
//         position: r.position || 99,
//       }))
//       .filter((r) => r.domain)
//       .filter((r) => !isHardBlocked(r.domain))
//       .filter((r) => !hasBlockedPath(r.link))
//       .filter((r) => !isGarbageTitle(r.title))

// .filter((r) => {
//   return !BAD_TITLE_PATTERNS.some((re) =>
//     re.test(r.title)
//   );
// })

// .filter((r) => {
//   const title =
//     String(r.title || '').toLowerCase();

//   const domain =
//     String(r.domain || '').toLowerCase();

//   if (
//     domain.includes('openai.com') &&
//     !title.includes('openai')
//   ) {
//     return false;
//   }

//   return true;
// })

// .filter((r) => {
//   const words =
//     String(r.title || '')
//       .trim()
//       .split(/\s+/);

//   return words.length <= 5;
// });

//   } catch (err) {
//     logger.warn({ err: err.message, q }, 'SerpAPI competitor search failed');
//     return [];
//   }
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * DEDUPLICATION
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// function dedupeByRoot(items, keyFn) {
//   const seen = new Set();
//   return items.filter((item) => {
//     const root = getRootDomain(keyFn(item));
//     if (!root || seen.has(root)) return false;
//     seen.add(root);
//     return true;
//   });
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * NORMALIZE AI-EXTRACTED COMPETITOR
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// function normalizeCompetitor(c) {
//   if (!c) return null;
//   const rawName = cleanBrandName(String(c.name || c.title || c.company || ''));
//   if (!rawName || rawName.length < 2) return null;

//   let domain = String(c.domain || c.website || '')
//     .toLowerCase()
//     .replace(/^https?:\/\/(www\.)?/, '')
//     .split('/')[0];
//   if (!domain) domain = `${rawName.toLowerCase().replace(/\s+/g, '')}.com`;

//   const rootDomain = getRootDomain(domain);
//   if (isHardBlocked(rootDomain)) return null;
//   if (isGarbageTitle(rawName))   return null;
//   if (hasDomainAgencyPattern(rootDomain) && !TRUSTED_DOMAINS.has(rootDomain)) return null;

//   const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

//   // Trust-boost for known real products
//   const isTrusted = TRUSTED_DOMAINS.has(rootDomain) || TRUSTED_DOMAINS.has(domain);
//   const basePopularity = Number(c.popularity) || 60;

//   return {
//     name,
//     website:      c.website    || `https://${rootDomain}`,
//     domain:       rootDomain,
//     description:  c.description || 'Market competitor',
//     popularity:   Math.min(100, Math.max(10, isTrusted ? Math.max(basePopularity, 75) : basePopularity)),
//     position:     ['Leader','Challenger','Niche','New entrant'].includes(c.position)
//                     ? c.position : 'Challenger',
//     pricing:      ['Free','Freemium','Low','Mid','Premium','Enterprise','Unknown'].includes(c.pricing)
//                     ? c.pricing : 'Unknown',
//     growthStatus: ['Surging','Growing','Stable','Declining'].includes(c.growthStatus)
//                     ? c.growthStatus : 'Stable',
//     trafficBand:  ['high','mid','low'].includes(c.trafficBand)
//                     ? c.trafficBand
//                     : (isTrusted ? 'high' : 'mid'),
//     _score:       isTrusted ? 100 : 60,  // internal sort key, removed before response
//   };
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * FALLBACK STUBS from raw search results (used when AI extraction is weak)
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// function buildFallbacks(results) {
//   return results
//     .map((r) => {
//       const qualityScore = scoreResult(r);
//       if (qualityScore < SCORE_THRESHOLD) return null; // drop junk outright

//       const segment    = r.title.split(/\s*[-–|·:,]\s*/)[0].trim();
//       const rawName    = cleanBrandName(segment);
//       const rootDomain = getRootDomain(r.domain);
//       const name       = rawName.length > 2
//         ? rawName
//         : rootDomain.split('.')[0].replace(/-/g, ' ');

//       if (!name || name.length < 2) return null;
//       if (isGarbageTitle(name)) return null;

//       const isTrusted = TRUSTED_DOMAINS.has(rootDomain);

//       return {
//         name:         name.charAt(0).toUpperCase() + name.slice(1),
//         website:      `https://${rootDomain}`,
//         domain:       rootDomain,
//         description:  r.snippet ? r.snippet.slice(0, 120) : 'Market competitor',
//         popularity:   Math.max(10, Math.round(isTrusted ? 85 : 70 - (r.position - 1) * 6)),
//         position:     r.position <= 2 ? 'Leader' : r.position <= 5 ? 'Challenger' : 'Niche',
//         pricing:      'Unknown',
//         growthStatus: 'Stable',
//         trafficBand:  r.position <= 3 ? 'high' : r.position <= 7 ? 'mid' : 'low',
//         _score:       qualityScore,
//       };
//     })
//     .filter(Boolean);
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * STRIP INTERNAL SORT KEY before returning to caller
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// function stripInternal(c) {
//   // eslint-disable-next-line no-unused-vars
//   const { _score, ...rest } = c;
//   return rest;
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//  * MAIN EXPORT
//  * ═══════════════════════════════════════════════════════════════════════════════ */

// async function findCompetitors(query) {
//   return cache.wrap(
//     `competitors:v4:${query.toLowerCase().trim()}`,
//     async () => {
//       /* ── 5 parallel search angles — query-agnostic ── */
//       const [a, b, c, d, e] = await Promise.all([
//         serpSearch(`${query} software alternatives competitors`),
//         serpSearch(`${query} saas tools platforms companies`),
//         serpSearch(`${query} product pricing plans`),
//         serpSearch(`${query} startup app enterprise solution`),
//         serpSearch(`${query} ai tool product official`),
//       ]);

//       /* Score each result, drop anything below threshold, sort by quality */
//       const scored = [...a, ...b, ...c, ...d, ...e]
//         .map((r) => ({ ...r, _score: scoreResult(r) }))
//         .filter((r) => r._score >= SCORE_THRESHOLD)
//         .sort((x, y) => y._score - x._score);

//       /* Root-domain deduplicate preserving highest-scored entry per company */
//       const combined = dedupeByRoot(scored, (r) => r.domain).slice(0, 25);

//       logger.info({ query, count: combined.length }, 'Competitor candidates after scoring');

//       if (!combined.length) return [];

//       /* ── AI extraction pass ── */
//       let aiResults = [];
//       try {
//         const extracted = await aiService.extractCompetitors(query, combined.slice(0, 20));
//         if (Array.isArray(extracted)) aiResults = extracted;
//       } catch (err) {
//         logger.warn({ err: err.message, query }, 'AI competitor extraction failed');
//       }

//       /* Normalize + validate AI output */
//       const rawCleanAI = aiResults.map(normalizeCompetitor).filter(Boolean);

//       /* Root-domain dedup AI results, keeping highest popularity per company */
//       const cleanAI = dedupeByRoot(
//         rawCleanAI.sort((x, y) => y._score - x._score),
//         (c) => c.domain,
//       );

//       /* ── Supplement with scored fallbacks if AI returned < 3 ── */
//       if (cleanAI.length < 3) {
//         const aiRoots = new Set(cleanAI.map((c) => getRootDomain(c.domain)));
//         const extras  = buildFallbacks(
//           combined.filter((r) => !aiRoots.has(getRootDomain(r.domain))),
//         ).sort((x, y) => y._score - x._score);

//         const needed = Math.max(3, 5) - cleanAI.length;
//         cleanAI.push(...extras.slice(0, needed));
//       }

//       /* ── Sort: trusted known products first, then by AI popularity ── */
//       cleanAI.sort((x, y) => {
//         const xTrusted = TRUSTED_DOMAINS.has(getRootDomain(x.domain)) ? 1 : 0;
//         const yTrusted = TRUSTED_DOMAINS.has(getRootDomain(y.domain)) ? 1 : 0;
//         if (xTrusted !== yTrusted) return yTrusted - xTrusted;
//         return (y._score || 0) - (x._score || 0);
//       });

//       /* Final root-domain dedup → cap at 8 → strip internal fields */
//       const result = dedupeByRoot(cleanAI, (c) => c.domain)
//         .slice(0, 8)
//         .map(stripInternal);

//       logger.info({ query, count: result.length }, 'Competitors resolved');
//       return result;
//     },
//     env.CACHE_COMPETITORS_TTL_MS,
//   );
// }

// module.exports = { findCompetitors };






// src/services/competitors.service.js
'use strict';

const axios     = require('axios');
const env       = require('../config/env');
const logger    = require('../config/logger');
const aiService = require('./ai.service');
const TTLCache  = require('../utils/cache');

const cache = new TTLCache({ max: 200 });

/* ═══════════════════════════════════════════════════════════════════════════════
 * BLOCKED DOMAINS — content farms, aggregators, social platforms
 * ═══════════════════════════════════════════════════════════════════════════════ */

const BLOCKED_DOMAINS = new Set([
  'g2.com','capterra.com','getapp.com','softwareadvice.com','trustpilot.com',
  'trustradius.com','gartner.com','alternativeto.net','slashdot.org',
  'sourceforge.net','saashub.com','stackshare.io','getlatka.com',
  'crozdesk.com','siftery.com','featuredcustomers.com','financesonline.com',
  'serchen.com','appvizer.com','toolbox.com',
  'apps.microsoft.com','play.google.com','apps.apple.com',
  'chrome.google.com','addons.mozilla.org','marketplace.atlassian.com',
  'linkedin.com','facebook.com','instagram.com','twitter.com','x.com',
  'tiktok.com','youtube.com','pinterest.com','reddit.com','quora.com',
  'medium.com','substack.com','blogger.com','tumblr.com','dev.to',
  'hashnode.com','ghost.io','wordpress.com','wix.com','squarespace.com',
  'wikipedia.org','techcrunch.com','forbes.com','inc.com','wired.com',
  'theverge.com','mashable.com','venturebeat.com','businessinsider.com',
  'zdnet.com','cnet.com','engadget.com','entrepreneur.com','pcmag.com',
  'tomsguide.com','digitaltrends.com','techradar.com','makeuseof.com',
  'howtogeek.com','lifewire.com','readwrite.com',
  'crunchbase.com','angellist.com','appsumo.com',
  'ifttt.com','make.com','featurelist.com','clutch.co',
  'goodfirms.co','designrush.com','sortlist.com','bark.com',
  'amazon.com','ebay.com','etsy.com','shopify.com',
  'indeed.com','glassdoor.com','toptal.com',
  'docs.google.com','gitbook.com','confluence.atlassian.com',
  'help.openai.com','support.google.com','learn.microsoft.com',
  'wildnetedge.com','semrush.com','ahrefs.com','moz.com',
  'searchengineland.com','searchenginejournal.com',
  'neilpatel.com','backlinko.com','contentmarketinginstitute.com',
]);

/* ── NOTE: producthunt.com is NOT in BLOCKED_DOMAINS so PH product pages
 *   can be mined via mineProductHunt() — we filter PH from final results
 *   separately in normalizeCompetitor. ─────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════════════
 * TRUSTED / BOOSTED DOMAINS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const TRUSTED_DOMAINS = new Set([
  // Marketplaces + freelance platforms
  'upwork.com','fiverr.com','freelancer.com','toptal.com','guru.com',
  'peopleperhour.com','99designs.com','designcrowd.com','bark.com',
  // AI products
  'openai.com','anthropic.com','perplexity.ai','jasper.ai','copy.ai',
  'writesonic.com','rytr.me','wordtune.com','grammarly.com',
  'character.ai','huggingface.co','replicate.com','stability.ai',
  'cohere.com','ai21.com','mistral.ai','groq.com','together.ai',
  'elevenlabs.io','murf.ai','descript.com','synthesia.io','heygen.com',
  'otter.ai','assemblyai.com','deepgram.com',
  // Productivity & SaaS
  'notion.so','airtable.com','monday.com','clickup.com','asana.com',
  'trello.com','basecamp.com','linear.app','jira.atlassian.com',
  'slack.com','discord.com','zoom.us','loom.com','miro.com',
  'figma.com','canva.com','adobe.com','sketch.com','invisionapp.com',
  // Dev tools
  'github.com','gitlab.com','vercel.com','supabase.com','stripe.com',
  'twilio.com','sendgrid.com','langchain.com','pinecone.io','n8n.io',
  // CRM / Marketing
  'hubspot.com','salesforce.com','intercom.com','zendesk.com',
  'freshdesk.com','typeform.com','calendly.com','mailchimp.com',
  'convertkit.com','beehiiv.com','ghost.org',
]);

/* ═══════════════════════════════════════════════════════════════════════════════
 * GARBAGE TITLE PATTERNS
 * NOTE: Deliberately NOT including "tools", "platform", "business",
 * "solutions", "services" — these appear in real competitor page titles
 * for generic queries ("AI tools platform", "freelancing business").
 * ═══════════════════════════════════════════════════════════════════════════════ */

const TITLE_GARBAGE_RE = [
  /\bbest\s+\d+\b/i,           // "best 10 tools"
  /\btop\s+\d+\b/i,            // "top 10 alternatives"
  /\balternatives?\b/i,
  /\bexamples?\b/i,
  /\bhow\s+to\b/i,
  /\bcomparison\b/i,
  /\bdirector(y|ies)\b/i,
  /\breviews?\b/i,
  /\bcompanies\s+that\s+use\b/i,
  /\bcustomer\s+list\b/i,
  /\bwho\s+owns\b/i,
  /\bwhat\s+is\b/i,
  /\bcomprehensive\b/i,
  /\bcurated\b/i,
  /\bultimate\s+guide\b/i,
  /\b20[0-9]{2}\s+(best|top|list)\b/i,
  /\bmost\s+(popular|used|powerful)\b/i,
  /\bwe['']?ve\s+compiled\b/i,
  /\bhere\s+are\b/i,
];

const SNIPPET_GARBAGE_RE = [
  /top\s+\d+/i, /best\s+\d+/i,
  /\bour\s+list\b/i, /\bcheck\s+out\b/i,
  /\bin\s+this\s+(article|guide|post|blog)\b/i,
  /\bcomprehensive\s+(guide|list|review)\b/i,
];

const BLOCKED_PATHS = [
  '/blog/', '/news/', '/article/', '/articles/',
  '/guide/', '/guides/', '/resources/', '/learn/',
  '/category/', '/tag/', '/tags/', '/press/',
  '/tips/', '/tutorial/', '/tutorials/',
  '/report/', '/reports/', '/whitepaper/', '/ebook/',
];

const DOMAIN_PATTERN_BLOCKLIST = [
  /agency/i, /seo/i,
  /blog(?!s?\.(com|io|ai))/i,    // allow "blogs.com" products, not "myblog.com"
  /news(?!letter)/i,              // allow "newsletter" in name
  /article/i,
  /review(?!\.io)/i,              // allow "review.io" (product)
  /ranking/i, /listing/i, /directory/i,
];

const PRODUCT_SIGNALS_RE = [
  /\bpric(e|ing)\b/i, /\bsign\s+up\b/i, /\bget\s+started\b/i,
  /\bfree\s+(plan|tier|account|trial)\b/i, /\bapi\b/i, /\bintegrat/i,
  /\bdashboard\b/i, /\bworkspace\b/i, /\bplatform\b/i,
  /\bai.powered\b/i, /\bautomation\b/i, /\bno.code\b/i, /\bsaas\b/i,
  /\bmarketplace\b/i, /\bhire\b/i, /\bfreelance\b/i,
  /\bapp\b/i, /\bsoftware\b/i, /\btool\b/i,
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); }
  catch { return null; }
}

function getRootDomain(domain) {
  if (!domain) return '';
  const d = String(domain).toLowerCase();
  const parts = d.split('.');
  if (parts.length <= 2) return d;
  const sld = parts[parts.length - 2];
  const tld = parts[parts.length - 1];
  const is3Part = ['co','com','org','net','gov','edu','ac'].includes(sld) && tld.length === 2;
  return is3Part ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
}

function isHardBlocked(domain) {
  if (!domain) return true;
  const d    = String(domain).toLowerCase();
  const root = getRootDomain(d);
  // Block producthunt.com from final results (we mine it separately)
  if (root === 'producthunt.com') return true;
  return BLOCKED_DOMAINS.has(d) || BLOCKED_DOMAINS.has(root);
}

function hasDomainAgencyPattern(domain) {
  const d = String(domain).toLowerCase();
  if (/\.(ai|io|app|dev|so|co|tech)$/.test(d)) return false;
  return DOMAIN_PATTERN_BLOCKLIST.some((re) => re.test(d.replace(/\.(com|org|net|io|ai|co)$/, '')));
}

function hasBlockedPath(url) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return BLOCKED_PATHS.some((p) => path.includes(p));
  } catch { return false; }
}

function isGarbageTitle(title) {
  return TITLE_GARBAGE_RE.some((re) => re.test(String(title)));
}

function snippetLooksGarbage(snippet) {
  if (!snippet) return false;
  return SNIPPET_GARBAGE_RE.some((re) => re.test(String(snippet)));
}

function hasProductSignal(title, snippet) {
  return PRODUCT_SIGNALS_RE.some((re) => re.test(`${title} ${snippet}`));
}

function cleanBrandName(raw = '') {
  return String(raw)
    .replace(/\b(best|top|review|comparison|alternative[s]?|vs|guide|free|online|20\d{2}|popular|curated)\b/gi, '')
    .replace(/[^\w\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SEMANTIC QUERY EXPANSION
 * Generates 7–9 targeted search angles based on query intent category.
 * Generic angles like "saas tools platforms companies" return blogs for broad
 * queries — these are deliberately crafted to surface product homepages.
 * ═══════════════════════════════════════════════════════════════════════════════ */

function buildSearchAngles(query) {
  const q = query.toLowerCase().trim();

  /* Category detection */
  const isFreelance    = /\b(freelanc|gig|remote[\s-]work|hire|talent|contractor|solopreneur)\b/.test(q);
  const isAI           = /\b(ai\b|artificial[\s-]intelligence|llm|gpt|chatbot|machine[\s-]learning|generative)\b/.test(q);
  const isContent      = /\b(content|writing|copywriting|blogging|seo|newsletter|copywriter)\b/.test(q);
  const isDev          = /\b(developer|coding|programming|devops|hosting|cloud|deploy|backend|frontend)\b/.test(q);
  const isMarketing    = /\b(marketing|email.market|social.media|advertising|paid.ads|ppc|crm)\b/.test(q);
  const isMarketplace  = /\b(marketplace|e[\s-]?commerce|sell.online|store|shop|shopify)\b/.test(q);
  const isProductivity = /\b(productivity|project.manage|task.manage|team|collaboration|workflow)\b/.test(q);

  /* Core angles — always included, tuned to avoid article/listicle results */
  const core = [
    `${query} product pricing plans`,                        // hits SaaS pricing pages
    `${query} software company startup`,                      // hits company homepages
    `${query} app platform product site:com OR site:io OR site:ai`,
    `${query} enterprise tool`,                               // hits B2B product pages
  ];

  /* Category-specific angles */
  if (isFreelance) return [
    ...core,
    `${query} marketplace hire platform`,
    `${query} talent platform for businesses`,
    `${query} gig platform app`,
    `freelance ${query} website hire`,
    `${query} job board platform`,
  ];

  if (isAI) return [
    ...core,
    `${query} API product startup`,
    `${query} assistant tool SaaS`,
    `${query} powered software pricing`,
    `${query} tool company venture`,
    `ChatGPT alternative ${query}`,
  ];

  if (isContent) return [
    ...core,
    `${query} tool platform startup`,
    `${query} software for creators`,
    `${query} AI tool product`,
    `${query} automation platform`,
  ];

  if (isDev) return [
    ...core,
    `${query} developer tool API`,
    `${query} platform infrastructure`,
    `${query} SaaS developer company`,
    `${query} open source product`,
  ];

  if (isMarketing) return [
    ...core,
    `${query} software tool pricing`,
    `${query} automation SaaS`,
    `${query} platform for businesses`,
    `${query} B2B product startup`,
  ];

  if (isMarketplace) return [
    ...core,
    `${query} platform website`,
    `${query} marketplace app`,
    `${query} company startup`,
    `sell ${query} online platform`,
  ];

  if (isProductivity) return [
    ...core,
    `${query} app workspace tool`,
    `${query} SaaS team collaboration`,
    `${query} platform for teams`,
    `${query} software dashboard`,
  ];

  /* Default: broad coverage for uncategorized queries */
  return [
    ...core,
    `${query} SaaS platform company`,
    `${query} tool startup website`,
    `${query} app company`,
  ];
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SCORING
 * ═══════════════════════════════════════════════════════════════════════════════ */

const SCORE_THRESHOLD = -8;

function scoreResult(r) {
  let score = 0;
  const root = getRootDomain(r.domain || '');

  if (TRUSTED_DOMAINS.has(root) || TRUSTED_DOMAINS.has(r.domain || '')) score += 45;
  if (/\.(ai|io|app|dev|so|tech)$/.test(r.domain || ''))                score += 18;

  try {
    const path = new URL(r.link).pathname.replace(/\/$/, '');
    if (path === '' || path === '/pricing' || path === '/features') score += 12;
    if (path.startsWith('/product') || path.startsWith('/solutions'))   score +=  6;
  } catch {}

  if (hasProductSignal(r.title, r.snippet)) score += 14;
  if (snippetLooksGarbage(r.snippet))       score -= 12;
  if (hasDomainAgencyPattern(r.domain))     score -= 22;

  /* Position penalty — smaller than before so mid-page results aren't killed */
  score -= Math.floor((r.position - 1) * 1.5);

  return score;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERPAPI ORGANIC SEARCH
 * REMOVED: words.length <= 5 filter (killed "Upwork - The Work Marketplace")
 * REMOVED: BAD_TITLE_PATTERNS for "tools", "platform", "business", "solutions"
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function serpSearch(q, num = 15) {
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: { engine: 'google', q, num, api_key: env.SERPAPI_KEY },
      timeout: env.SERPAPI_TIMEOUT_MS,
    });

    return (data?.organic_results || [])
      .map((r) => ({
        title:    r.title    || '',
        link:     r.link     || '',
        snippet:  r.snippet  || '',
        domain:   extractDomain(r.link),
        position: r.position || 99,
      }))
      .filter((r) => r.domain)
      .filter((r) => !isHardBlocked(r.domain))
      .filter((r) => !hasBlockedPath(r.link))
      .filter((r) => !isGarbageTitle(r.title));

    /* NOTE: No word-count filter — homepage titles like
     * "Upwork - The Work Marketplace" (5+ words) are now included. */

  } catch (err) {
    logger.warn({ err: err.message, q }, 'serpSearch failed');
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCTHUNT ENTITY MINING
 * Searches site:producthunt.com to extract real product names.
 * PH pages title format: "ProductName - Product Hunt"
 * These names feed the AI as additional context — not used as final competitors.
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function mineProductHunt(query) {
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine:  'google',
        q:       `site:producthunt.com ${query}`,
        num:     10,
        api_key: env.SERPAPI_KEY,
      },
      timeout: env.SERPAPI_TIMEOUT_MS,
    });

    return (data?.organic_results || [])
      .map((r) => {
        // "Upwork - Product Hunt" → "Upwork"
        const name = (r.title || '').replace(/\s*[-–|]\s*product\s+hunt.*$/i, '').trim();
        return name.length > 1 ? { name, snippet: r.snippet || '' } : null;
      })
      .filter(Boolean);

  } catch (err) {
    logger.warn({ err: err.message, query }, 'mineProductHunt failed');
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * REDDIT SIGNAL EXTRACTION
 * Searches Reddit discussions for tool recommendations via SerpAPI Google.
 * Returns extracted snippets for AI to mine entity names from.
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function mineRedditMentions(query) {
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine:  'google',
        q:       `site:reddit.com "${query}" tool OR platform OR app OR software recommendations`,
        num:     6,
        api_key: env.SERPAPI_KEY,
      },
      timeout: env.SERPAPI_TIMEOUT_MS,
    });

    /* Collect snippets from Reddit threads — AI will extract brand names */
    const snippets = (data?.organic_results || [])
      .map((r) => r.snippet || '')
      .filter(Boolean)
      .join(' | ');

    return snippets;
  } catch (err) {
    logger.warn({ err: err.message, query }, 'mineRedditMentions failed');
    return '';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GOOGLE RELATED SEARCHES MINING
 * SerpAPI returns related_searches in the response JSON.
 * Some of these ARE product names (e.g., "jasper ai", "copy.ai").
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function mineRelatedSearches(query) {
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine:  'google',
        q:       `${query} tool platform`,
        num:     3,        // we only want the related_searches, not organic
        api_key: env.SERPAPI_KEY,
      },
      timeout: env.SERPAPI_TIMEOUT_MS,
    });

    /* Related searches like "jasper ai", "copy.ai pricing" → clean up and return */
    const relatedTerms = (data?.related_searches || [])
      .map((r) => r.query || '')
      .filter(Boolean)
      .slice(0, 8);

    /* Also check related_questions for entity extraction context */
    const questionSnippets = (data?.related_questions || [])
      .map((q) => q.snippet || '')
      .join(' ');

    return { relatedTerms, questionSnippets };
  } catch (err) {
    logger.warn({ err: err.message, query }, 'mineRelatedSearches failed');
    return { relatedTerms: [], questionSnippets: '' };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * YOUTUBE SIGNAL EXTRACTION
 * Uses SerpAPI YouTube engine to find tools mentioned in video titles.
 * Tutorial/review titles like "Jasper AI Tutorial" surface real product names.
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function mineYouTubeSignals(query) {
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine:       'youtube',
        search_query: `${query} tool tutorial review 2024`,
        api_key:      env.SERPAPI_KEY,
      },
      timeout: env.SERPAPI_TIMEOUT_MS,
    });

    return (data?.video_results || [])
      .slice(0, 8)
      .map((v) => ({
        title:   v.title        || '',
        channel: v.channel?.name || '',
        snippet: v.description?.snippet || '',
      }));
  } catch (err) {
    logger.warn({ err: err.message, query }, 'mineYouTubeSignals failed');
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DEDUPLICATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

function dedupeByRoot(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const root = getRootDomain(keyFn(item));
    if (!root || seen.has(root)) return false;
    seen.add(root);
    return true;
  });
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * NORMALIZE AI-EXTRACTED COMPETITOR
 * ═══════════════════════════════════════════════════════════════════════════════ */

function normalizeCompetitor(c) {
  if (!c) return null;
  const rawName = cleanBrandName(String(c.name || c.title || c.company || ''));
  if (!rawName || rawName.length < 2) return null;

  let domain = String(c.domain || c.website || '')
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, '')
    .split('/')[0];
  if (!domain) domain = `${rawName.toLowerCase().replace(/\s+/g, '')}.com`;

  const rootDomain = getRootDomain(domain);
  if (isHardBlocked(rootDomain))                                    return null;
  if (isGarbageTitle(rawName))                                      return null;
  if (hasDomainAgencyPattern(rootDomain) && !TRUSTED_DOMAINS.has(rootDomain)) return null;

  const name      = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const isTrusted = TRUSTED_DOMAINS.has(rootDomain) || TRUSTED_DOMAINS.has(domain);

  return {
    name,
    website:      c.website || `https://${rootDomain}`,
    domain:       rootDomain,
    description:  c.description || 'Market competitor',
    popularity:   Math.min(100, Math.max(10, isTrusted ? Math.max(Number(c.popularity) || 60, 75) : (Number(c.popularity) || 60))),
    position:     ['Leader','Challenger','Niche','New entrant'].includes(c.position)   ? c.position   : 'Challenger',
    pricing:      ['Free','Freemium','Low','Mid','Premium','Enterprise','Unknown'].includes(c.pricing) ? c.pricing    : 'Unknown',
    growthStatus: ['Surging','Growing','Stable','Declining'].includes(c.growthStatus)  ? c.growthStatus : 'Stable',
    trafficBand:  ['high','mid','low'].includes(c.trafficBand)
                    ? c.trafficBand
                    : (isTrusted ? 'high' : 'mid'),
    _score:       isTrusted ? 100 : 60,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * FALLBACK STUBS from raw SERP results
 * ═══════════════════════════════════════════════════════════════════════════════ */

function buildFallbacks(results) {
  return results
    .map((r) => {
      const q = scoreResult(r);
      if (q < SCORE_THRESHOLD) return null;

      const segment    = r.title.split(/\s*[-–|·:,]\s*/)[0].trim();
      const rawName    = cleanBrandName(segment);
      const rootDomain = getRootDomain(r.domain);
      const name       = rawName.length > 2
        ? rawName
        : rootDomain.split('.')[0].replace(/-/g, ' ');

      if (!name || name.length < 2 || isGarbageTitle(name)) return null;

      const isTrusted = TRUSTED_DOMAINS.has(rootDomain);

      return {
        name:         name.charAt(0).toUpperCase() + name.slice(1),
        website:      `https://${rootDomain}`,
        domain:       rootDomain,
        description:  r.snippet ? r.snippet.slice(0, 120) : 'Market competitor',
        popularity:   Math.max(10, Math.round(isTrusted ? 85 : 68 - (r.position - 1) * 5)),
        position:     r.position <= 2 ? 'Leader' : r.position <= 5 ? 'Challenger' : 'Niche',
        pricing:      'Unknown',
        growthStatus: 'Stable',
        trafficBand:  r.position <= 3 ? 'high' : r.position <= 7 ? 'mid' : 'low',
        _score:       q,
      };
    })
    .filter(Boolean);
}

function stripInternal(c) {
  const { _score, ...rest } = c;
  return rest;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function findCompetitors(query) {
  return cache.wrap(
    `competitors:v5:${query.toLowerCase().trim()}`,
    async () => {
      const angles = buildSearchAngles(query);
      logger.info({ query, angles: angles.length }, 'Starting competitor discovery');

      /* ── Phase 1: All data sources in parallel ── */
      const [
        serpResults,
        phEntities,
        redditText,
        relatedData,
        ytSignals,
      ] = await Promise.all([
        /* SERP: run all category-aware angles simultaneously */
        Promise.all(angles.map((a) => serpSearch(a, 15)))
          .then((batches) => batches.flat()),

        /* ProductHunt entity mining */
        mineProductHunt(query),

        /* Reddit mention extraction */
        mineRedditMentions(query),

        /* Google related searches + questions */
        mineRelatedSearches(query),

        /* YouTube signal extraction */
        mineYouTubeSignals(query),
      ]);

      logger.info({
        query,
        serpRaw:   serpResults.length,
        phEntities:phEntities.length,
        ytSignals: ytSignals.length,
        relatedTerms: relatedData.relatedTerms.length,
      }, 'Phase 1 complete');

      /* ── Phase 2: Score + deduplicate SERP results ── */
      const scored = serpResults
        .map((r) => ({ ...r, _score: scoreResult(r) }))
        .filter((r) => r._score >= SCORE_THRESHOLD)
        .sort((x, y) => y._score - x._score);

      const combined = dedupeByRoot(scored, (r) => r.domain).slice(0, 30);

      logger.info({ query, candidates: combined.length }, 'Phase 2: candidates scored');

      /* ── Phase 3: Build rich context for AI extraction ── */
      const phContext = phEntities.length
        ? `\nProductHunt products found: ${phEntities.map((p) => p.name).join(', ')}`
        : '';

      const ytContext = ytSignals.length
        ? `\nYouTube tool mentions (from tutorials/reviews): ${ytSignals.map((v) => v.title).join(' | ')}`
        : '';

      const redditContext = redditText
        ? `\nReddit community discussions mention these tools: ${redditText.slice(0, 600)}`
        : '';

      const relatedContext = relatedData.relatedTerms.length
        ? `\nGoogle related searches (may include product names): ${relatedData.relatedTerms.join(', ')}`
        : '';

      const additionalContext = [phContext, ytContext, redditContext, relatedContext]
        .filter(Boolean)
        .join('\n');

      /* ── Phase 4: AI extraction with full multi-source context ── */
      let aiResults = [];
      try {
        /* Pass both SERP results AND supplemental context to AI */
        const extracted = await aiService.extractCompetitors(
          query,
          combined.slice(0, 20),
          additionalContext,          // ← new third argument
        );
        if (Array.isArray(extracted)) aiResults = extracted;
      } catch (err) {
        logger.warn({ err: err.message, query }, 'AI competitor extraction failed');
      }

      /* ── Phase 5: Normalize + deduplicate AI output ── */
      const rawCleanAI = aiResults.map(normalizeCompetitor).filter(Boolean);

      const cleanAI = dedupeByRoot(
        rawCleanAI.sort((x, y) => (y._score || 0) - (x._score || 0)),
        (c) => c.domain,
      );

      /* Supplement with scored SERP fallbacks when AI extraction is thin */
      if (cleanAI.length < 4) {
        const aiRoots = new Set(cleanAI.map((c) => getRootDomain(c.domain)));
        const extras  = buildFallbacks(
          combined.filter((r) => !aiRoots.has(getRootDomain(r.domain))),
        ).sort((x, y) => (y._score || 0) - (x._score || 0));

        const needed = Math.max(4, 6) - cleanAI.length;
        cleanAI.push(...extras.slice(0, needed));
      }

      /* ── Phase 6: Sort + final dedup + strip internals ── */
      cleanAI.sort((x, y) => {
        const xT = TRUSTED_DOMAINS.has(getRootDomain(x.domain)) ? 1 : 0;
        const yT = TRUSTED_DOMAINS.has(getRootDomain(y.domain)) ? 1 : 0;
        if (xT !== yT) return yT - xT;
        return (y._score || 0) - (x._score || 0);
      });

      const result = dedupeByRoot(cleanAI, (c) => c.domain)
        .slice(0, 8)
        .map(stripInternal);

      logger.info({ query, count: result.length }, 'Competitors resolved');
      return result;
    },
    env.CACHE_COMPETITORS_TTL_MS,
  );
}

module.exports = { findCompetitors };