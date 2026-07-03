# Trend Validator — Backend API

Production-grade Node.js/Express backend for the **Trend Validator** React Native app. Verifies Firebase ID tokens, manages a per-user credit ledger in Firestore, fetches Google Trends data via SerpAPI, and synthesises an analysis using OpenAI (with Groq as automatic fallback).

The `/api/analyze` response shape is **byte-compatible with `src/data/mockData.js → sampleResult`** — drop-in replacement for the existing frontend with zero UI changes.

---

## 1. Folder structure

```
trend-validator-backend/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── server.js                # entry — listen, signals, graceful shutdown
    ├── app.js                   # express composition, middleware order
    ├── config/
    │   ├── env.js               # zod-validated env loader
    │   ├── firebase.js          # admin init (3 credential strategies)
    │   └── logger.js            # pino logger + redaction
    ├── middleware/
    │   ├── auth.js              # verifyIdToken + lazy user provisioning
    │   ├── error.js             # 404 + central error handler
    │   ├── rateLimit.js         # IP rate limiter
    │   └── validate.js          # zod request validation
    ├── routes/
    │   ├── index.js
    │   ├── analyze.routes.js
    │   └── user.routes.js
    ├── controllers/
    │   ├── analyze.controller.js
    │   └── user.controller.js
    ├── services/
    │   ├── analyze.service.js   # orchestrator: credits → trends → AI → persist
    │   ├── credit.service.js    # atomic reserve / refund / settle
    │   ├── trend.service.js     # SerpAPI Google Trends client + stats
    │   ├── ai.service.js        # OpenAI primary, Groq fallback, JSON repair
    │   └── history.service.js   # Firestore subcollection
    └── utils/
        ├── asyncHandler.js
        ├── errors.js            # AppError hierarchy
        └── schemas.js           # zod request schemas
```

---

## 2. Setup

### Prerequisites
- Node.js **≥ 18.17**
- Firebase project (Auth + Firestore enabled)
- API keys: OpenAI (required), SerpAPI (required), Groq (recommended)

### Install
```bash
npm install
cp .env.example .env
# fill in real values
npm run dev          # nodemon, pretty logs
# or
npm start            # production
```

Server starts on `http://localhost:4000` (or `$PORT`).

### Firebase credentials
Pick **one** of three strategies in `.env`:
1. **`GOOGLE_APPLICATION_CREDENTIALS`** → absolute path to a service account JSON. Best for VMs / Cloud Run / GKE.
2. **`FIREBASE_SERVICE_ACCOUNT`** → entire service account JSON pasted as a single string (escape `private_key` newlines as `\n`).
3. **`FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`** → discrete fields. Same `\n` escaping rule. Easiest for Render/Railway/Heroku UIs.

Firestore Security Rules: **all writes go through Admin SDK and bypass rules** — that's intentional. Keep client-side rules locked down (`allow read, write: if false;`) for the `users` collection in production; only the backend mutates credits.

---

## 3. API

All routes under `/api/*` require a Firebase ID token:
```
Authorization: Bearer <ID_TOKEN>
```

### `POST /api/analyze`
**Body:**
```json
{ "query": "AI Voice Agents", "geo": "US", "timeframe": "today 12-m" }
```
`geo` and `timeframe` are optional. Defaults: global + 12-month window.

**200 Response** (matches `sampleResult` shape used by `ResultsScreen.js`):
```json
{
  "query": "AI Voice Agents",
  "score": 87,
  "verdict": "High Potential",
  "growth": "+184%",
  "duration": "6–9 months",
  "engagement": 73,
  "risk": 28,
  "opportunity": 82,
  "series": [10, 14, 18, ...],
  "insights": ["...", "...", "...", "..."],
  "explanation": "...",
  "_meta": { "provider": "openai", "historyId": "...", "creditsRemaining": 2 }
}
```

**Errors:**
| Status | Code | Cause |
|--------|------|-------|
| 400 | `BAD_REQUEST` | Validation failed (missing/short query) |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired Firebase token |
| 402 | `INSUFFICIENT_CREDITS` | User has 0 credits |
| 429 | `RATE_LIMITED` | IP rate limit exceeded |
| 502 | `UPSTREAM_ERROR` | Both OpenAI and Groq unavailable (credit auto-refunded) |

### `GET /api/user/me`
Returns `{ uid, email, name, credits, plan, totalAnalyses }`.

### `GET /api/user/history?limit=25`
Returns `{ items: [...], count }` newest-first.

### `GET /health`
Public liveness probe. `{ status: "ok", uptime: <s> }`.

---

## 4. Architecture decisions

### Credit ledger — **Reserve / Settle / Refund** pattern
Naïve "deduct after success" is unsafe under concurrency. Naïve "deduct before" charges users for failed analyses.

The `credit.service.js` uses a Firestore `runTransaction` to **atomically check-and-decrement** at request start (`reserve`). If the AI pipeline fails, the credit is **refunded**. Successful runs are settled with a metadata bump. Net effect:
- ✅ Race-condition safe (two concurrent requests can't double-spend)
- ✅ User never charged for upstream failures
- ✅ Credit drift recoverable from logs (`lastRefundReason`, `lastRefundAt`)

### AI fallback chain
OpenAI is primary (better JSON adherence, lower variance). Groq is fallback (10× faster, cheaper, but occasionally noisier). Both use `response_format: json_object`. `safeParseJSON` strips fences and pluck-recovers on imperfect outputs. If both fail → 502 with credit refund.

### Response shape coercion
LLMs produce best-effort JSON. `shapeResponse()` clamps numerics to `[0,100]`, validates `verdict` against the allowed enum (with score-based fallback), and pads/truncates `insights` to exactly 4 items — frontend never sees malformed data.

### SerpAPI is "best-effort"
Google Trends sometimes returns sparse data. The service swallows SerpAPI errors and continues with empty series — the AI still produces an analysis from related queries + the user's framing. Frontend always gets a valid response shape.

---

## 5. Performance & failure modes

| Concern | Mitigation |
|---|---|
| Cold AI call latency | OpenAI `gpt-4o-mini` (~1–2s p50). Groq fallback is sub-second. |
| Firestore hot key | Per-user docs — no cross-user contention. |
| Silent AI hangs | Hard `AI_TIMEOUT_MS` (default 20s) on both providers. |
| Token replay | `verifyIdToken(token, true)` checks revocation. |
| Memory leak from `console` | Pino async logger, no `console.*` in hot paths. |
| Unbounded request bodies | `express.json({ limit: '256kb' })`. |
| Sensitive logs | `pino` redacts `authorization`, `*.apiKey`, `*.private_key`. |
| Deploy crash loop | Graceful shutdown 10s drain, supervisor restart on uncaught exception. |

---

## 6. Frontend integration (no UI changes)

Replace mock import in `src/screens/ResultsScreen.js` with a fetch on mount. The shape already matches — the rest of the screen continues to read `r.score`, `r.series`, `r.insights`, etc.

```js
// Example call (place this in a service module)
async function analyzeTrend(idToken, query) {
  const res = await fetch('https://your-api.com/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  return res.json(); // <-- has the same shape as sampleResult
}
```
Get `idToken` from `firebase/auth` on the RN side: `await user.getIdToken()`.

---

## 7. Suggested improvements (not asked for, but worth doing)

1. **Caching layer (Redis or Firestore TTL doc)** — keyed by `(query, geo, timeframe)` with 30–60min TTL. Same query from 100 users = 1 SerpAPI + 1 OpenAI call.
2. **Idempotency keys** — accept `Idempotency-Key` header on `/analyze` so RN retries on flaky networks don't double-charge before the response lands.
3. **Webhook for Stripe later** — when adding paid plans, drop them straight into `credit.service.js` as a `topUp(uid, amount)`. Architecture already supports it.
4. **Move SerpAPI/OpenAI to a queue** — for >50 RPS or premium tiers, push the analyze pipeline to BullMQ so a slow upstream doesn't tie up Express workers. Return `202 Accepted` + poll endpoint.
5. **Per-user rate limit** — current limiter is per-IP. Add a Firestore-backed per-`uid` limiter to stop a single account hammering the AI providers from many devices.
6. **Structured prompt versioning** — pin a `promptVersion` field to each saved analysis so you can A/B-test prompt changes without losing history comparability.
7. **Replay & cost tracking** — log `provider`, `model`, `prompt_tokens`, `completion_tokens` per call to a `usage` collection. Critical before Stripe integration so you know your unit economics.
8. **App Check** — front the API with Firebase App Check to block calls from anywhere that isn't your real RN app, regardless of stolen tokens.

---

## 8. Local smoke test (without a real Firebase token)

For quick wiring checks before integrating Firebase, you can temporarily swap `auth` middleware for a stub on a feature branch — but **do not ship that**. The current code requires a real ID token end-to-end. Use the Firebase Auth REST API or your RN dev build to obtain one.

```bash
curl http://localhost:4000/health
# {"status":"ok","uptime":12.34}

curl -X POST http://localhost:4000/api/analyze \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"AI Voice Agents"}'
```
