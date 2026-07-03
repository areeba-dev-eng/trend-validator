// backend/src/utils/cache.js
'use strict';

class TTLCache {
  constructor({ ttlMs = 30 * 60 * 1000, max = 500 } = {}) {
    this.ttlMs = ttlMs;
    this.max = max;
    this.store = new Map();
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }
  set(key, value, ttlMs = this.ttlMs) {
    if (this.store.size >= this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  async wrap(key, fn, ttlMs) {
    const cached = this.get(key);
    if (cached !== null) return cached;
    const value = await fn();
    this.set(key, value, ttlMs);
    return value;
  }
  delete(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

module.exports = TTLCache;