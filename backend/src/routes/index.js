// 'use strict';

// const { Router } =
//   require('express');

// const analyzeRoutes =
//   require('./analyze.routes');

// const userRoutes =
//   require('./user.routes');

// const trendsRoutes =
//   require('./trends.routes');

// const historyRoutes =
//   require('./history.routes');

// const router = Router();

// router.use(
//   '/analyze',
//   analyzeRoutes
// );

// router.use(
//   '/user',
//   userRoutes
// );

// router.use(
//   '/trends',
//   trendsRoutes
// );

// router.use(
//   '/history',
//   historyRoutes
// );

// module.exports = router;

// src/routes/index.js
'use strict';

const { Router } = require('express');

const analyzeRoutes  = require('./analyze.routes');
const userRoutes     = require('./user.routes');
const trendsRoutes   = require('./trends.routes');
const historyRoutes  = require('./history.routes');
const ideaRoutes     = require('./idea.routes');
const insightsRoutes = require('./insights.routes');
const nicheRoutes    = require('./niche.routes');

const router = Router();

router.use('/analyze',  analyzeRoutes);
router.use('/user',     userRoutes);
router.use('/trends',   trendsRoutes);
router.use('/history',  historyRoutes);
router.use('/ideas',    ideaRoutes);
router.use('/insights', insightsRoutes);
router.use('/niches',   nicheRoutes);

module.exports = router;
