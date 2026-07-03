'use strict';

const { Router } = require('express');
const auth = require('../middleware/auth').default;
const validate = require('../middleware/validate');
const { analyzeSchema } = require('../utils/schemas');
const { analyze } = require('../controllers/analyze.controller');

const router = Router();

// POST /api/analyze
router.post('/', auth, validate(analyzeSchema), analyze);

module.exports = router;