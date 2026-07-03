// src/controllers/insights.controller.js
'use strict';

const asyncHandler    = require('../utils/asyncHandler');
const insightsService = require('../services/insights.service');

const getMarketInsights = asyncHandler(async (req, res) => {
  const { keyword } = req.body;
  const result = await insightsService.getMarketInsights(keyword);
  res.status(200).json(result);
});

module.exports = { getMarketInsights };
