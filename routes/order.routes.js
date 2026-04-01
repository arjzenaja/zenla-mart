const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAuth } = require('../middlewares/role.middleware');
const {
  getMyOrders,
  getAllOrdersHandler,
  getOrder,
  createOrderHandler,
  updateOrderStatusHandler
} = require('../controllers/order.controller');

router.use(authenticate);

// User routes
router.get('/my-orders', getMyOrders);
router.post('/checkout', createOrderHandler);
router.get('/:id', getOrder);

// Admin routes
router.get('/', ...requireAuth(['admin']), getAllOrdersHandler);
router.put('/:id/status', ...requireAuth(['admin']), updateOrderStatusHandler);

module.exports = router;
