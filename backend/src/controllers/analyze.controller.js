'use strict';

const asyncHandler = require('../utils/asyncHandler');
const analyzeService = require('../services/analyze.service');

const analyze = asyncHandler(async (req, res) => {
  const { query, geo, timeframe } = req.body;
  if (!query || !String(query).trim()) {

  return res.status(400).json({
    error: 'Query is required',
  });
}
  const result = await analyzeService.runAnalyze({
    uid: req.user.uid,
    query,
    geo,
    timeframe,
  });
  res.status(200).json(result);
});

module.exports = { analyze };
