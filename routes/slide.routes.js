const express = require('express');
const router = express.Router();
const { authenticate, authenticateOptional } = require('../middlewares/auth.middleware');
const { requireAuth } = require('../middlewares/role.middleware');
const {
  getSlides,
  getSlide,
  createSlideHandler,
  updateSlideHandler,
  deleteSlideHandler
} = require('../controllers/slide.controller');

// Public routes (optional auth for admin view)
router.get('/', authenticateOptional, getSlides);
router.get('/:id', getSlide);

// Admin routes
router.post('/', ...requireAuth(['admin']), createSlideHandler);
router.put('/:id', ...requireAuth(['admin']), updateSlideHandler);
router.delete('/:id', ...requireAuth(['admin']), deleteSlideHandler);

module.exports = router;
