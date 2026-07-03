// // src/middleware/auth.js
// 'use strict';
// import { auth as adminAuth, db, FieldValue } from '../config/firebase.js';
// import logger from '../config/logger.js';
// const USERS = 'users';

// /*
//  * Lazy-provision a Firestore user document on the first authenticated
//  * request from a new user. Fire-and-forget — never blocks the main path.
//  */
// async function provisionUser(uid, email) {
//   const ref = db.collection(USERS).doc(uid);
//   try {
//     const snap = await ref.get();
//     if (!snap.exists) {
//       await ref.set({
//         uid,
//         email:          email || '',
//         credits:        Number(process.env.DEFAULT_CREDITS) || 100,
//         plan:           'free',
//         totalAnalyses:  0,
//         createdAt:      FieldValue.serverTimestamp(),
//         lastSeenAt:     FieldValue.serverTimestamp(),
//       });
//       logger.info({ uid }, 'auth: new user provisioned in Firestore');
//     } else {
//       /* Non-critical — fire and forget */
//       ref.update({ lastSeenAt: FieldValue.serverTimestamp() }).catch(() => {});
//     }
//   } catch (err) {
//     /* Non-fatal: user can continue even if provisioning fails */
//     logger.warn({ err: err.message, uid }, 'auth: user provisioning warning');
//   }
// }

// /*
//  * Auth middleware — verifies Firebase ID token on every /api/* request.
//  *
//  * AUTH_DISABLED bypass is permanently removed.
//  * All routes require a valid Bearer token from the Firebase Auth client SDK.
//  */
// export default async function authMiddleware(req, res, next) {
//   const authHeader = req.headers.authorization || '';

//   if (!authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({
//       error: {
//         code:    'UNAUTHORIZED',
//         message: 'Authorization header missing. Include "Authorization: Bearer <token>".',
//       },
//     });
//   }

//   const idToken = authHeader.slice(7).trim();

//   if (!idToken || idToken.length < 20) {
//     return res.status(401).json({
//       error: {
//         code:    'UNAUTHORIZED',
//         message: 'Token is missing or malformed.',
//       },
//     });
//   }

//   try {
//     /*
//      * checkRevoked=true: rejects tokens whose underlying session was
//      * revoked via Firebase Admin SDK (e.g. after forced sign-out).
//      * Adds ~1 network round-trip — acceptable for security.
//      */
//     const decoded = await adminAuth.verifyIdToken(idToken, /* checkRevoked */ true);

//     req.user = {
//       uid:   decoded.uid,
//       email: decoded.email || '',
//     };

//     /* Non-blocking: user provisioning runs in background */
//     provisionUser(decoded.uid, decoded.email).catch(() => {});

//     return next();

//   } catch (err) {
//     logger.warn({ err: err.message, ip: req.ip }, 'auth: token verification failed');

//     /* Map Firebase error codes to user-friendly messages */
//     const messages = {
//       'auth/id-token-expired':  'Token has expired. Please sign in again.',
//       'auth/id-token-revoked':  'Session was revoked. Please sign in again.',
//       'auth/argument-error':    'Malformed token.',
//       'auth/certificate-query-failed': 'Auth service temporarily unavailable.',
//     };

//     const message = messages[err.code] || 'Invalid or expired token. Please sign in again.';

//     return res.status(401).json({
//       error: { code: 'UNAUTHORIZED', message },
//     });
//   }
// };

// src/middleware/auth.js
'use strict';

const { auth: adminAuth, db, FieldValue } = require('../config/firebase');
const logger = require('../config/logger');

const USERS = 'users';

async function provisionUser(uid, email) {
  const ref = db.collection(USERS).doc(uid);
  try {
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        uid,
        email:          email || '',
        credits:        Number(process.env.DEFAULT_CREDITS) || 100,
        plan:           'free',
        totalAnalyses:  0,
        createdAt:      FieldValue.serverTimestamp(),
        lastSeenAt:     FieldValue.serverTimestamp(),
      });
      logger.info({ uid }, 'auth: new user provisioned in Firestore');
    } else {
      ref.update({ lastSeenAt: FieldValue.serverTimestamp() }).catch(() => {});
    }
  } catch (err) {
    logger.warn({ err: err.message, uid }, 'auth: user provisioning warning');
  }
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code:    'UNAUTHORIZED',
        message: 'Authorization header missing. Include "Authorization: Bearer <token>".',
      },
    });
  }

  const idToken = authHeader.slice(7).trim();

  if (!idToken || idToken.length < 20) {
    return res.status(401).json({
      error: {
        code:    'UNAUTHORIZED',
        message: 'Token is missing or malformed.',
      },
    });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    req.user = {
      uid:   decoded.uid,
      email: decoded.email || '',
    };

    provisionUser(decoded.uid, decoded.email).catch(() => {});

    return next();

  } catch (err) {
    logger.warn({ err: err.message, ip: req.ip }, 'auth: token verification failed');

    const messages = {
      'auth/id-token-expired':         'Token has expired. Please sign in again.',
      'auth/id-token-revoked':         'Session was revoked. Please sign in again.',
      'auth/argument-error':           'Malformed token.',
      'auth/certificate-query-failed': 'Auth service temporarily unavailable.',
    };

    const message = messages[err.code] || 'Invalid or expired token. Please sign in again.';

    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message },
    });
  }
}

/* Exported both ways — every existing route does
 * require('../middleware/auth').default, so that shape is preserved
 * while also supporting a direct require() for new code. */
module.exports = authMiddleware;
module.exports.default = authMiddleware;
