


// // src/services/api.js
// import { API_BASE_URL, API_TIMEOUT_MS, API_TIMEOUT_FAST_MS } from '../config/api';
// import { auth } from '../config/firebase';

// /* ============================================================================
//  * Error class
//  * ========================================================================== */

// export class ApiError extends Error {
//   constructor(message, { code = 'UNKNOWN', status = 0, details } = {}) {
//     super(message);
//     this.name    = 'ApiError';
//     this.code    = code;
//     this.status  = status;
//     this.details = details;
//   }
// }

// /* ============================================================================
//  * Auth headers — reads live Firebase ID token from current session.
//  *
//  * PREVIOUSLY: AsyncStorage.getItem('token') — key was never written,
//  * so every request went out with no Authorization header.
//  * AUTH_DISABLED=true on the backend was masking this bug.
//  *
//  * NOW: auth.currentUser.getIdToken() — always fresh, auto-refreshes
//  * when the 1-hour Firebase token expires (forceRefresh handled by SDK).
//  * ========================================================================== */

// async function getAuthHeaders() {
//   try {
//     const currentUser = auth.currentUser;
//     if (!currentUser) return {};
//     /* false = use cached token unless within 5 min of expiry;
//        Firebase SDK silently refreshes when needed.              */
//     const idToken = await currentUser.getIdToken(false);
//     return { Authorization: `Bearer ${idToken}` };
//   } catch (err) {
//     console.warn('[api] getIdToken failed:', err?.message);
//     return {};
//   }
// }

// /* ============================================================================
//  * Retry helper — no retry on TIMEOUT / AUTH_REQUIRED / 4xx
//  * ========================================================================== */

// async function withRetry(fn, retries = 2) {
//   try {
//     return await fn();
//   } catch (err) {
//     const noRetry =
//       err.code === 'TIMEOUT' ||
//       err.code === 'AUTH_REQUIRED' ||
//       (err.status >= 400 && err.status < 500);
//     if (retries <= 0 || noRetry) throw err;
//     await new Promise((r) => setTimeout(r, 700));
//     return withRetry(fn, retries - 1);
//   }
// }

// /* ============================================================================
//  * Core request
//  * ========================================================================== */

// async function request(
//   path,
//   { method = 'GET', body, signal, headers = {}, timeoutMs = API_TIMEOUT_MS } = {},
// ) {
//   const controller = new AbortController();
//   const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

//   if (signal) {
//     if (signal.aborted) controller.abort();
//     else signal.addEventListener('abort', () => controller.abort(), { once: true });
//   }

//   try {
//     const authHeaders = await getAuthHeaders();

//     const res = await fetch(`${API_BASE_URL}${path}`, {
//       method,
//       headers: {
//         Accept: 'application/json',
//         ...(body ? { 'Content-Type': 'application/json' } : {}),
//         ...authHeaders,
//         ...headers,
//       },
//       body:   body ? JSON.stringify(body) : undefined,
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     let data = null;
//     try { data = await res.json(); } catch { /* non-JSON body */ }

//     if (!res.ok) {
//       if (res.status === 401) {
//         throw new ApiError('Authentication required. Please sign in again.', {
//           code: 'AUTH_REQUIRED', status: 401,
//         });
//       }
//       throw new ApiError(
//         data?.error?.message || `Request failed (${res.status})`,
//         { code: data?.error?.code || 'HTTP_ERROR', status: res.status, details: data?.error?.details },
//       );
//     }

//     if (!data) {
//       throw new ApiError('Empty response from server.', { code: 'EMPTY_RESPONSE' });
//     }

//     return data;
//   } catch (err) {
//     clearTimeout(timeoutId);

//     if (err.name === 'AbortError') {
//       throw new ApiError('Request timed out. Check your network connection.', { code: 'TIMEOUT' });
//     }

//     if (err instanceof ApiError) throw err;

//     throw new ApiError(
//       'Cannot reach server. Check that the backend is running and the API URL is correct.',
//       { code: 'NETWORK_ERROR', details: err.message },
//     );
//   }
// }

// /* ============================================================================
//  * Normalize raw backend trend item → consistent shape for HomeScreen cards
//  * ========================================================================== */

// function normalizeTrendItem(item, index) {
//   let change;
//   if (typeof item?.change === 'string' && item.change.includes('%')) {
//     change = item.change;
//   } else if (typeof item?.growthRate === 'string' && item.growthRate.includes('%')) {
//     change = item.growthRate;
//   } else {
//     const g = Number(item?.growth ?? item?.slopePct ?? 0);
//     change = `${g >= 0 ? '+' : ''}${g.toFixed(1)}%`;
//   }

//   return {
//     id:       item?.id ? String(item.id) : String(index),
//     title:    item?.title    || item?.keyword || item?.name || item?.topic || 'Live Trend',
//     subtitle: item?.subtitle || item?.category || item?.niche || 'Trending',
//     category: item?.category || item?.subtitle || item?.niche || 'Trending',
//     score:    Number(item?.score ?? item?.trendScore ?? item?.marketDemand ?? 0),
//     change,
//     series:   Array.isArray(item?.series) && item.series.length >= 2
//                 ? item.series : [20, 35, 55, 70, 85],
//     color:    item?.color || ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'][index % 4],
//   };
// }

// /* ============================================================================
//  * Endpoints
//  * ========================================================================== */

// /** POST /api/analyze */
// export function analyzeTrend(query, { signal, geo, timeframe } = {}) {
//   return withRetry(() =>
//     request('/api/analyze', { method: 'POST', body: { query, geo, timeframe }, signal }),
//   );
// }

// /**
//  * GET /api/trends/live
//  * Returns empty items array on failure — UI shows real empty state.
//  * No hardcoded fallback data.
//  */
// export async function fetchLiveTrends({ signal, limit = 4 } = {}) {
//   try {
//     const response = await withRetry(() =>
//       request(`/api/trends/live?limit=${encodeURIComponent(limit)}`, {
//         signal,
//         timeoutMs: API_TIMEOUT_FAST_MS,
//       }),
//     );

//     let raw = null;
//     if (Array.isArray(response))                  raw = response;
//     else if (Array.isArray(response?.items))       raw = response.items;
//     else if (Array.isArray(response?.trends))      raw = response.trends;
//     else if (Array.isArray(response?.data?.items)) raw = response.data.items;

//     if (raw && raw.length > 0) {
//       return { items: raw.map(normalizeTrendItem) };
//     }

//     console.warn('[api] fetchLiveTrends: backend returned empty trend array');
//     return { items: [] };
//   } catch (err) {
//     console.warn('[api] fetchLiveTrends failed:', err?.message);
//     return { items: [] };
//   }
// }

// /** GET /api/trends/competitors?q=... */
// export function fetchCompetitors(query, { signal } = {}) {
//   return withRetry(() =>
//     request(`/api/trends/competitors?q=${encodeURIComponent(query)}`, {
//       signal,
//       timeoutMs: API_TIMEOUT_FAST_MS,
//     }),
//   );
// }

// /** GET /api/trends/sources?q=... */
// export function fetchTrendSources(query, { signal } = {}) {
//   return withRetry(() =>
//     request(`/api/trends/sources?q=${encodeURIComponent(query)}`, {
//       signal,
//       timeoutMs: API_TIMEOUT_FAST_MS,
//     }),
//   );
// }

// /** GET /api/history — returns array of history items */
// export function fetchHistory({ limit = 25, signal } = {}) {
//   return withRetry(() =>
//     request(`/api/history?limit=${encodeURIComponent(limit)}`, { signal }),
//   );
// }

// /** DELETE /api/history/:id */
// export function deleteHistoryItem(id, { signal } = {}) {
//   return withRetry(() =>
//     request(`/api/history/${id}`, { method: 'DELETE', signal }),
//   );
// }

// /** POST /api/export/report */
// export function exportTrendReport(payload, { signal } = {}) {
//   return withRetry(() =>
//     request('/api/export/report', {
//       method:    'POST',
//       body:      payload,
//       signal,
//       timeoutMs: API_TIMEOUT_MS * 2,
//     }),
//   );
// }

// src/services/api.js
import { API_BASE_URL, API_TIMEOUT_MS, API_TIMEOUT_FAST_MS } from '../config/api';
import { auth } from '../config/firebase';

/* ============================================================================
 * Error class
 * ========================================================================== */

export class ApiError extends Error {
  constructor(message, { code = 'UNKNOWN', status = 0, details } = {}) {
    super(message);
    this.name    = 'ApiError';
    this.code    = code;
    this.status  = status;
    this.details = details;
  }
}

/* ============================================================================
 * Auth headers — reads live Firebase ID token from current session.
 * ========================================================================== */

async function getAuthHeaders() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return {};
    const idToken = await currentUser.getIdToken(false);
    return { Authorization: `Bearer ${idToken}` };
  } catch (err) {
    console.warn('[api] getIdToken failed:', err?.message);
    return {};
  }
}

/* ============================================================================
 * Retry helper — no retry on TIMEOUT / AUTH_REQUIRED / 4xx
 * ========================================================================== */

async function withRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    const noRetry =
      err.code === 'TIMEOUT' ||
      err.code === 'AUTH_REQUIRED' ||
      (err.status >= 400 && err.status < 500);
    if (retries <= 0 || noRetry) throw err;
    await new Promise((r) => setTimeout(r, 700));
    return withRetry(fn, retries - 1);
  }
}

/* ============================================================================
 * Core request
 * ========================================================================== */

async function request(
  path,
  { method = 'GET', body, signal, headers = {}, timeoutMs = API_TIMEOUT_MS } = {},
) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const authHeaders = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders,
        ...headers,
      },
      body:   body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data = null;
    try { data = await res.json(); } catch { /* non-JSON body */ }

    if (!res.ok) {
      if (res.status === 401) {
        throw new ApiError('Authentication required. Please sign in again.', {
          code: 'AUTH_REQUIRED', status: 401,
        });
      }
      throw new ApiError(
        data?.error?.message || `Request failed (${res.status})`,
        { code: data?.error?.code || 'HTTP_ERROR', status: res.status, details: data?.error?.details },
      );
    }

    if (!data) {
      throw new ApiError('Empty response from server.', { code: 'EMPTY_RESPONSE' });
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Check your network connection.', { code: 'TIMEOUT' });
    }

    if (err instanceof ApiError) throw err;

    throw new ApiError(
      'Cannot reach server. Check that the backend is running and the API URL is correct.',
      { code: 'NETWORK_ERROR', details: err.message },
    );
  }
}

/* ============================================================================
 * Normalize raw backend trend item → consistent shape for HomeScreen cards
 * ========================================================================== */

function normalizeTrendItem(item, index) {
  let change;
  if (typeof item?.change === 'string' && item.change.includes('%')) {
    change = item.change;
  } else if (typeof item?.growthRate === 'string' && item.growthRate.includes('%')) {
    change = item.growthRate;
  } else {
    const g = Number(item?.growth ?? item?.slopePct ?? 0);
    change = `${g >= 0 ? '+' : ''}${g.toFixed(1)}%`;
  }

  return {
    id:       item?.id ? String(item.id) : String(index),
    title:    item?.title    || item?.keyword || item?.name || item?.topic || 'Live Trend',
    subtitle: item?.subtitle || item?.category || item?.niche || 'Trending',
    category: item?.category || item?.subtitle || item?.niche || 'Trending',
    score:    Number(item?.score ?? item?.trendScore ?? item?.marketDemand ?? 0),
    change,
    series:   Array.isArray(item?.series) && item.series.length >= 2
                ? item.series : [20, 35, 55, 70, 85],
    color:    item?.color || ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'][index % 4],
  };
}

/* ============================================================================
 * Endpoints
 * ========================================================================== */

/** POST /api/analyze */
export function analyzeTrend(query, { signal, geo, timeframe } = {}) {
  return withRetry(() =>
    request('/api/analyze', { method: 'POST', body: { query, geo, timeframe }, signal }),
  );
}

/**
 * GET /api/trends/live
 * Returns empty items array on failure — UI shows real empty state.
 * No hardcoded fallback data.
 */
export async function fetchLiveTrends({ signal, limit = 4 } = {}) {
  try {
    const response = await withRetry(() =>
      request(`/api/trends/live?limit=${encodeURIComponent(limit)}`, {
        signal,
        timeoutMs: API_TIMEOUT_FAST_MS,
      }),
    );

    let raw = null;
    if (Array.isArray(response))                  raw = response;
    else if (Array.isArray(response?.items))       raw = response.items;
    else if (Array.isArray(response?.trends))      raw = response.trends;
    else if (Array.isArray(response?.data?.items)) raw = response.data.items;

    if (raw && raw.length > 0) {
      return { items: raw.map(normalizeTrendItem) };
    }

    console.warn('[api] fetchLiveTrends: backend returned empty trend array');
    return { items: [] };
  } catch (err) {
    console.warn('[api] fetchLiveTrends failed:', err?.message);
    return { items: [] };
  }
}

/** GET /api/trends/competitors?q=... */
export function fetchCompetitors(query, { signal } = {}) {
  return withRetry(() =>
    request(`/api/trends/competitors?q=${encodeURIComponent(query)}`, {
      signal,
      timeoutMs: API_TIMEOUT_FAST_MS,
    }),
  );
}

/** GET /api/trends/sources?q=... */
export function fetchTrendSources(query, { signal } = {}) {
  return withRetry(() =>
    request(`/api/trends/sources?q=${encodeURIComponent(query)}`, {
      signal,
      timeoutMs: API_TIMEOUT_FAST_MS,
    }),
  );
}

/** GET /api/history — returns array of history items */
export function fetchHistory({ limit = 25, signal } = {}) {
  return withRetry(() =>
    request(`/api/history?limit=${encodeURIComponent(limit)}`, { signal }),
  );
}

/** DELETE /api/history/:id */
export function deleteHistoryItem(id, { signal } = {}) {
  return withRetry(() =>
    request(`/api/history/${id}`, { method: 'DELETE', signal }),
  );
}

/** POST /api/export/report */
export function exportTrendReport(payload, { signal } = {}) {
  return withRetry(() =>
    request('/api/export/report', {
      method:    'POST',
      body:      payload,
      signal,
      timeoutMs: API_TIMEOUT_MS * 2,
    }),
  );
}

/** POST /api/ideas — Generate Idea */
export function generateIdeas(keyword, { signal } = {}) {
  return withRetry(() =>
    request('/api/ideas', { method: 'POST', body: { keyword }, signal, timeoutMs: API_TIMEOUT_MS }),
  );
}

/** POST /api/insights — Market Insights */
export function fetchMarketInsights(keyword, { signal } = {}) {
  return withRetry(() =>
    request('/api/insights', { method: 'POST', body: { keyword }, signal, timeoutMs: API_TIMEOUT_MS }),
  );
}

/** POST /api/niches — Niche Finder */
export function findNiches(keyword, { signal } = {}) {
  return withRetry(() =>
    request('/api/niches', { method: 'POST', body: { keyword }, signal, timeoutMs: API_TIMEOUT_MS }),
  );
}
