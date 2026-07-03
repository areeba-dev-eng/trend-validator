// // src/services/credit.service.js
// 'use strict';

// const { db, FieldValue } = require('../config/firebase');
// const { AppError }       = require('../utils/errors');
// const logger             = require('../config/logger');
// const env                = require('../config/env');

// const USERS = 'users';

// /* ─── InsufficientCreditsError ───────────────────────────────────────────── */

// class InsufficientCreditsError extends AppError {
//   constructor(message = 'Insufficient credits') {
//     super(message, 402, 'INSUFFICIENT_CREDITS');
//   }
// }

// /* ─── reserve ────────────────────────────────────────────────────────────── */

// /**
//  * Atomically check-and-decrement credits in a Firestore transaction.
//  * Throws InsufficientCreditsError if the user doesn't have enough credits.
//  * Auto-provisions a new user doc if one doesn't exist.
//  */
// async function reserve(uid, cost = 1) {
//   const userRef = db.collection(USERS).doc(uid);

//   return db.runTransaction(async (tx) => {
//     const snap = await tx.get(userRef);

//     if (!snap.exists) {
//       /* New user — provision with default credits and deduct immediately */
//       const remaining = env.DEFAULT_CREDITS - cost;
//       if (remaining < 0) throw new InsufficientCreditsError();

//       tx.set(userRef, {
//         credits:       remaining,
//         totalAnalyses: 0,
//         plan:          'free',
//         createdAt:     FieldValue.serverTimestamp(),
//         lastSeenAt:    FieldValue.serverTimestamp(),
//       }, { merge: true });

//       logger.info({ uid, remaining }, 'credits: new user provisioned and reserved');
//       return { remaining };
//     }

//     const data     = snap.data();
//     const current  = typeof data.credits === 'number' ? data.credits : env.DEFAULT_CREDITS;

//   if (current < cost) {
//   throw new InsufficientCreditsError(
//     `Insufficient credits: have ${current}, need ${cost}`,
//   );
// }
//     const remaining = current - cost;

//     tx.update(userRef, {
//       credits:        FieldValue.increment(-cost),
//       lastReservedAt: FieldValue.serverTimestamp(),
//     });

//     logger.info({ uid, cost, remaining }, 'credits: reserved');
//     return { remaining };
//   });
// }

// /* ─── settle ─────────────────────────────────────────────────────────────── */

// /**
//  * Record a completed analysis in Firestore.
//  *
//  * PREVIOUSLY: mock — returned { settled: true } with NO database write.
//  * totalAnalyses never incremented; usage tracking was broken.
//  *
//  * NOW: real Firestore update — increments totalAnalyses and records timestamp.
//  * Uses set+merge so it's safe even if the user doc was somehow deleted.
//  */
// async function settle(uid) {
//   const userRef = db.collection(USERS).doc(uid);

//   try {
//     await userRef.set({
//       totalAnalyses:  FieldValue.increment(1),
//       lastAnalysisAt: FieldValue.serverTimestamp(),
//     }, { merge: true });

//     logger.info({ uid }, 'credits: settled — totalAnalyses incremented');
//     return { settled: true };

//   } catch (err) {
//     /* Non-fatal: credit was already deducted (reserve succeeded).
//      * Log the failure but don't throw — the analysis result is still valid. */
//     logger.error({ err: err.message, uid }, 'credits: settle write failed (non-fatal)');
//     return { settled: false, reason: err.message };
//   }
// }

// /* ─── refund ─────────────────────────────────────────────────────────────── */

// /**
//  * Refund credits when the analysis pipeline fails.
//  * Uses set+merge so it works even if the user doc was partially written.
//  */
// async function refund(uid, cost, reason) {
//   if (!uid) return;

//   try {
//     await db.collection(USERS).doc(uid).set({
//       credits:           FieldValue.increment(cost),
//       lastRefundAt:      FieldValue.serverTimestamp(),
//       lastRefundReason:  reason || 'unknown',
//     }, { merge: true });

//     logger.info({ uid, cost, reason }, 'credits: refunded');
//   } catch (err) {
//     logger.error({ err: err.message, uid, cost }, 'credits: refund failed');
//   }
// }

// module.exports = { reserve, settle, refund, InsufficientCreditsError };


// src/services/credit.service.js
'use strict';

const { db, FieldValue } = require('../config/firebase');
const { AppError }       = require('../utils/errors');
const logger              = require('../config/logger');
const env                  = require('../config/env');

const USERS = 'users';

class InsufficientCreditsError extends AppError {
  constructor(message = 'Insufficient credits') {
    super(message, 402, 'INSUFFICIENT_CREDITS');
  }
}

async function reserve(uid, cost = 1) {
  const userRef = db.collection(USERS).doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);

    if (!snap.exists) {
      const remaining = env.DEFAULT_CREDITS - cost;
      if (remaining < 0) throw new InsufficientCreditsError();

      tx.set(userRef, {
        credits:       remaining,
        totalAnalyses: 0,
        plan:          'free',
        createdAt:     FieldValue.serverTimestamp(),
        lastSeenAt:    FieldValue.serverTimestamp(),
      }, { merge: true });

      logger.info({ uid, remaining }, 'credits: new user provisioned and reserved');
      return { remaining };
    }

    const data    = snap.data();
    const current = typeof data.credits === 'number' ? data.credits : env.DEFAULT_CREDITS;

    if (current < cost) {
      throw new InsufficientCreditsError(
        `Insufficient credits: have ${current}, need ${cost}`,
      );
    }

    const remaining = current - cost;

    tx.update(userRef, {
      credits:        FieldValue.increment(-cost),
      lastReservedAt: FieldValue.serverTimestamp(),
    });

    logger.info({ uid, cost, remaining }, 'credits: reserved');
    return { remaining };
  });
}

async function settle(uid) {
  const userRef = db.collection(USERS).doc(uid);

  try {
    await userRef.set({
      totalAnalyses:  FieldValue.increment(1),
      lastAnalysisAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    logger.info({ uid }, 'credits: settled — totalAnalyses incremented');
    return { settled: true };

  } catch (err) {
    logger.error({ err: err.message, uid }, 'credits: settle write failed (non-fatal)');
    return { settled: false, reason: err.message };
  }
}

async function refund(uid, cost, reason) {
  if (!uid) return;

  try {
    await db.collection(USERS).doc(uid).set({
      credits:           FieldValue.increment(cost),
      lastRefundAt:      FieldValue.serverTimestamp(),
      lastRefundReason:  reason || 'unknown',
    }, { merge: true });

    logger.info({ uid, cost, reason }, 'credits: refunded');
  } catch (err) {
    logger.error({ err: err.message, uid, cost }, 'credits: refund failed');
  }
}

module.exports = { reserve, settle, refund, InsufficientCreditsError };
