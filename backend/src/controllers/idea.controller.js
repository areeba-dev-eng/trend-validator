// src/controllers/idea.controller.js
'use strict';

const asyncHandler = require('../utils/asyncHandler');
const ideaService   = require('../services/idea.service');

const generateIdea = asyncHandler(async (req, res) => {
  const { keyword } = req.body;
  const result = await ideaService.generateIdeas(req.user.uid, keyword);
  res.status(200).json(result);
});

module.exports = { generateIdea };
