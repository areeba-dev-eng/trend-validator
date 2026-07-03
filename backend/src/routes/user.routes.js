'use strict';

const { Router } = require('express');
const auth = require('../middleware/auth').default;
const { me, history } = require('../controllers/user.controller');

const router = Router();

router.get('/me', auth, me);
router.get('/history', auth, history);

module.exports = router;
