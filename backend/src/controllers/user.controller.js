'use strict';

const asyncHandler = require('../utils/asyncHandler');
const creditService = require('../services/credit.service');
const historyService = require('../services/history.service');

const me = asyncHandler(async (req, res) => {
  const credits = await creditService.getCredits(req.user.uid);
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name,
    credits,
    plan: req.user.profile?.plan || 'free',
    totalAnalyses: req.user.profile?.totalAnalyses || 0,
  });
});

const history = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 25;
  const items = await historyService.listAnalyses(req.user.uid, { limit });
  res.json({ items, count: items.length });
});

module.exports = { me, history };
