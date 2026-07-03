// backend/src/services/history.service.js
'use strict';

const { db, FieldValue } = require('../config/firebase');
const logger = require('../config/logger');

const USERS   = 'users';
const HISTORY = 'history';

/**
 * Serialize growth — can arrive as "+18.4%" string OR raw number 18.4.
 * Always stored as formatted string so frontend displays it correctly.
 */
function serializeGrowth(g) {
  if (typeof g === 'string' && g.includes('%')) return g;        // already formatted
  const n = parseFloat(String(g).replace('%', '').replace('+', '').trim());
  if (!Number.isFinite(n)) return '+0.0%';
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function sanitizeRecord(record) {
  return {
    query:     (record.query || '').trim().toLowerCase(),
    geo:       record.geo       || null,
    timeframe: record.timeframe || 'today 12-m',
    provider:  record.provider  || 'unknown',
    result: {
      score:            Number(record.result?.score            || 0),
      confidenceScore:  Number(record.result?.confidenceScore  || 0),
      verdict:          record.result?.verdict   || 'Unknown',
      growth:           serializeGrowth(record.result?.growth),   // "+18.4%" string
      duration:         record.result?.duration  || 'Unknown',
      engagement:       Number(record.result?.engagement       || 0),
      risk:             Number(record.result?.risk             || 0),
      opportunity:      Number(record.result?.opportunity      || 0),
      searchVolume:     Number(record.result?.searchVolume     || 0),
      marketDemand:     Number(record.result?.marketDemand     || 0),
      competitionLevel: Number(record.result?.competitionLevel || 0),
      saturationLevel:  Number(record.result?.saturationLevel  || 0),
      viralProbability: Number(record.result?.viralProbability || 0),
      competitors: Array.isArray(record.result?.competitors) ? record.result.competitors : [],
      insights:    Array.isArray(record.result?.insights)    ? record.result.insights    : [],
      explanation: record.result?.explanation || '',
      series:      Array.isArray(record.result?.series)      ? record.result.series      : [],
    },
    analytics: {
      scoreBand:  getScoreBand(record.result?.score || 0),
      riskBand:   getRiskBand(record.result?.risk   || 0),
      momentum:   parseGrowthNum(record.result?.growth),
      analyzedAt: new Date().toISOString(),
    },
    createdAt: FieldValue.serverTimestamp(),
  };
}

function parseGrowthNum(g) {
  if (!g) return 0;
  const n = parseFloat(String(g).replace('%', '').replace('+', '').trim());
  return Number.isFinite(n) ? n : 0;
}

function getScoreBand(score) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'weak';
}

function getRiskBand(risk) {
  if (risk >= 75) return 'danger';
  if (risk >= 50) return 'moderate';
  return 'safe';
}

/** Convert any Firestore Timestamp shape → ISO string */
function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  const secs = value.seconds ?? value._seconds;
  if (typeof secs === 'number') return new Date(secs * 1000).toISOString();
  return null;
}

async function saveAnalysis(uid, record) {
  try {
    const clean            = sanitizeRecord(record);
    const normalizedQuery  = clean.query;

    /* Upsert by query — avoid duplicate entries for same keyword */
    const existing = await db
      .collection(USERS).doc(uid)
      .collection(HISTORY)
      .where('query', '==', normalizedQuery)
      .limit(1).get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({
        ...clean,
        createdAt: FieldValue.serverTimestamp(),
      });
      return existing.docs[0].id;
    }

    const ref = await db
      .collection(USERS).doc(uid)
      .collection(HISTORY)
      .add(clean);

    return ref.id;
  } catch (err) {
    logger.warn({ err: err.message, uid }, 'Failed to persist analysis history');
    return null;
  }
}

async function listAnalyses(uid, { limit = 25 } = {}) {
  try {
    const snap = await db
      .collection(USERS).doc(uid)
      .collection(HISTORY)
      .orderBy('createdAt', 'desc')
      .limit(Math.min(500, Math.max(1, limit)))
      .get();

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: serializeTimestamp(data.createdAt),   // always ISO string
      };
    });
  } catch (err) {
    logger.error({ err: err.message, uid }, 'Failed to fetch history');
    return [];
  }
}

async function deleteAnalysis(uid, analysisId) {
  try {
    await db.collection(USERS).doc(uid).collection(HISTORY).doc(analysisId).delete();
    return true;
  } catch (err) {
    logger.warn({ err: err.message, uid, analysisId }, 'Failed to delete history item');
    return false;
  }
}

module.exports = { saveAnalysis, listAnalyses, deleteAnalysis };