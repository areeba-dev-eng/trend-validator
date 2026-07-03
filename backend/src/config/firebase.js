// import admin from 'firebase-admin';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// let serviceAccount;

// const serviceAccountPath = path.join(
//   __dirname,
//   '../../serviceAccount.json'
// );

// if (fs.existsSync(serviceAccountPath)) {
//   serviceAccount = JSON.parse(
//     fs.readFileSync(serviceAccountPath, 'utf8')
//   );
// } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
//   serviceAccount = JSON.parse(
//     process.env.FIREBASE_SERVICE_ACCOUNT_JSON
//   );
// } else {
//   throw new Error(
//     'Missing Firebase service account credentials'
//   );
// }

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const db = admin.firestore();

// const auth = admin.auth();

// const FieldValue = admin.firestore.FieldValue;

// export {
//   admin,
//   auth,
//   db,
//   FieldValue,
// };


// src/config/firebase.js
'use strict';

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');

let serviceAccount;

const serviceAccountPath = path.join(__dirname, '../../serviceAccount.json');

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  throw new Error('Missing Firebase service account credentials');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

module.exports = { admin, auth, db, FieldValue };
