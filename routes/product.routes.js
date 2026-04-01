const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAuth } = require('../middlewares/role.middleware');
const {
  getProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  addProductReviewHandler,
  updateStockHandler
} = require('../controllers/product.controller');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Authenticated customer routes
router.post('/:id/reviews', authenticate, addProductReviewHandler);

// Admin routes
router.post('/', ...requireAuth(['admin']), createProductHandler);
router.put('/:id', ...requireAuth(['admin']), updateProductHandler);
router.patch('/:id/stock', ...requireAuth(['admin']), updateStockHandler);
router.delete('/:id', ...requireAuth(['admin']), deleteProductHandler);

module.exports = router;
