// src/controllers/niche.controller.js
'use strict';

const asyncHandler = require('../utils/asyncHandler');
const nicheService  = require('../services/niche.service');

const discoverNiches = asyncHandler(async (req, res) => {
  const { keyword } = req.body;
  const result = await nicheService.findNiches(req.user.uid, keyword);
  res.status(200).json(result);
});

module.exports = { discoverNiches };
