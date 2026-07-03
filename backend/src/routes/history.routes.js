'use strict';

const express = require('express');

const auth =
  require('../middleware/auth').default;

const {
  getHistory,
} = require(
  '../controllers/history.controller'
);

const router =
  express.Router();

router.get(
  '/',
  auth,
  getHistory
);

module.exports = router;