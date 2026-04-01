const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getCart,
  addToCartHandler,
  updateCartItemHandler,
  removeFromCartHandler
} = require('../controllers/cart.controller');

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCartHandler);
router.put('/:productId', updateCartItemHandler);
router.delete('/:productId', removeFromCartHandler);

module.exports = router;
