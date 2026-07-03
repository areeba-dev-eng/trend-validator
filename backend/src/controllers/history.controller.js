'use strict';

const asyncHandler = require('../utils/asyncHandler');

const {
  listAnalyses,
} = require('../services/history.service');

const getHistory = asyncHandler(
  async (req, res) => {
    const items =
      await listAnalyses(
        req.user.uid,
        {
          limit: Number(
            req.query.limit || 25
          ),
        }
      );

    res.status(200).json(items);
  }
);

module.exports = {
  getHistory,
};