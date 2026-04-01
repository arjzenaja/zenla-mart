const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAuth } = require('../middlewares/role.middleware');
const {
  getMe,
  updateMe,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserRole,
  updateUserHandler,
  getUserAddressesHandler,
  deleteUserHandler
} = require('../controllers/user.controller');

// User routes (authenticated)
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

// Admin routes
router.get('/', ...requireAuth(['admin']), getAllUsersHandler);
// Specific routes must come before parameterized routes
router.get('/:id/addresses', ...requireAuth(['admin']), getUserAddressesHandler);
router.get('/:id', ...requireAuth(['admin']), getUserByIdHandler);
router.put('/:id/role', ...requireAuth(['admin']), updateUserRole);
router.put('/:id', ...requireAuth(['admin']), updateUserHandler);
router.delete('/:id', ...requireAuth(['admin']), deleteUserHandler);

module.exports = router;
