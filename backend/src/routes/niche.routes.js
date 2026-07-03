// src/routes/niche.routes.js
'use strict';

const { Router } = require('express');
const auth = require('../middleware/auth').default;
const validate = require('../middleware/validate');
const { nicheSchema } = require('../utils/schemas');
const { discoverNiches } = require('../controllers/niche.controller');

const router = Router();

// POST /api/niches
router.post('/', auth, validate(nicheSchema), discoverNiches);

module.exports = router;
