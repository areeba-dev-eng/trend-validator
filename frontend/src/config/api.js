/**
 * API configuration.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.106:4000';

/**
 * Long requests:
 * AI analysis
 * competitors
 * trend intelligence
 */
export const API_TIMEOUT_MS = 90000;

/**
 * Fast requests:
 * live trends
 * lightweight fetches
 */
export const API_TIMEOUT_FAST_MS = 15000;