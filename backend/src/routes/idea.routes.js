// src/routes/idea.routes.js
'use strict';

const { Router } = require('express');
const auth = require('../middleware/auth').default;
const validate = require('../middleware/validate');
const { ideaSchema } = require('../utils/schemas');
const { generateIdea } = require('../controllers/idea.controller');

const router = Router();

// POST /api/ideas
router.post('/', auth, validate(ideaSchema), generateIdea);

module.exports = router;
