const express = require('express');
const router = express.Router();
const {
  register,
  loginUser,
  googleLogin,
  verifyEmail,
  forgotPassword,
  verifyResetOTPHandler,
  resetPasswordHandler
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTPHandler);
router.post('/reset-password', resetPasswordHandler);

module.exports = router;
