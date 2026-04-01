const express = require('express');
const router = express.Router();
const { adminLogin, getMe } = require('../controllers/adminAuth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

/**
 * POST /admin/login
 * Public route - tidak perlu authentication
 */
router.post('/login', adminLogin);

/**
 * GET /admin/me
 * Protected route - memerlukan authentication dan role admin
 */
router.get('/me', authenticate, requireAdmin, getMe);

module.exports = router;
