const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/role.middleware');
const {
  getCategories,
  getCategory,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} = require('../controllers/category.controller');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', ...requireAuth(['admin']), createCategoryHandler);
router.put('/:id', ...requireAuth(['admin']), updateCategoryHandler);
router.delete('/:id', ...requireAuth(['admin']), deleteCategoryHandler);

module.exports = router;
