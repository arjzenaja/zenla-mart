const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAuth } = require('../middlewares/role.middleware');
const {
  getBanners,
  getBanner,
  createBannerHandler,
  updateBannerHandler,
  deleteBannerHandler
} = require('../controllers/banner.controller');

// Public routes (optional auth for admin view)
router.get('/', getBanners);
router.get('/:id', getBanner);

// Admin routes
router.post('/', ...requireAuth(['admin']), createBannerHandler);
router.put('/:id', ...requireAuth(['admin']), updateBannerHandler);
router.delete('/:id', ...requireAuth(['admin']), deleteBannerHandler);

module.exports = router;
