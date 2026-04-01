const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getWishlist,
  addToWishlistHandler,
  removeFromWishlistHandler,
  removeAllFromWishlistHandler,
  addToCartFromWishlistHandler,
  addAllToCartHandler,
  getAllWishlistsHandler
} = require('../controllers/wishlist.controller');
const { requireAuth } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlistHandler);
router.delete('/:productId', removeFromWishlistHandler);
router.delete('/', removeAllFromWishlistHandler);
router.post('/add-to-cart', addToCartFromWishlistHandler);
router.post('/add-all-to-cart', addAllToCartHandler);

// Admin routes
router.get('/admin/all', requireAuth(['admin']), getAllWishlistsHandler);

module.exports = router;
