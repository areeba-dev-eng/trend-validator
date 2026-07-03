// src/routes/insights.routes.js
'use strict';

const { Router } = require('express');
const auth = require('../middleware/auth').default;
const validate = require('../middleware/validate');
const { insightsSchema } = require('../utils/schemas');
const { getMarketInsights } = require('../controllers/insights.controller');

const router = Router();

// POST /api/insights
router.post('/', auth, validate(insightsSchema), getMarketInsights);

module.exports = router;
