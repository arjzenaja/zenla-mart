const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/role.middleware');
const { getStats, getSales } = require('../controllers/dashboard.controller');

router.get('/stats', ...requireAuth(['admin']), getStats);
router.get('/sales', ...requireAuth(['admin']), getSales);

module.exports = router;
