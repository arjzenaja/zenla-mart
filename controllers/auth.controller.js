const { createUser } = require('../services/user.service');
const { login, sendOTP, verifyOTP, sendResetOTP, verifyResetOTP, resetPassword } = require('../services/auth.service');
const { generateToken } = require('../utils/jwt.util');

// REGISTER + AUTO GENERATE OTP (dev: OTP di console)
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // 1) Create user with hashed password & isVerified = false
    const user = await createUser({ name, email, password, phone, role });

    // 2) Generate & store OTP, log to console (dev only)
    const otpResult = await sendOTP(email);

    // 3) Response: register ok + info OTP dikirim
    res.status(201).json({
      success: true,
      message: 'User registered successfully. OTP has been sent to your email.',
      user
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await login(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const result = await verifyOTP(email, otp);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Send OTP (always returns success for security)
    await sendResetOTP(email);
    
    // Always return same message regardless of whether email exists
    res.json({
      success: true,
      message: 'Jika email terdaftar, instruksi reset password telah dikirim'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const verifyResetOTPHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email dan OTP diperlukan'
      });
    }

    await verifyResetOTP(email, otp);
    
    res.json({
      success: true,
      message: 'OTP valid, silakan lanjutkan reset password'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const resetPasswordHandler = async (req, res, next) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, dan password baru diperlukan'
      });
    }

    // Reset password (validates OTP internally and clears it)
    await resetPassword(email, otp, new_password);
    
    res.json({
      success: true,
      message: 'Password berhasil diperbarui'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { email, name, image } = req.body;
    console.log('Backend: Google Login request received for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const { createOrUpdateGoogleUser } = require('../services/user.service');
    const user = await createOrUpdateGoogleUser({ email, name, image });
    
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Google login successful',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  loginUser,
  googleLogin,
  verifyEmail,
  forgotPassword,
  verifyResetOTPHandler,
  resetPasswordHandler
};
