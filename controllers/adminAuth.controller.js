const { loginAdmin, getAdminProfile } = require('../services/adminAuth.service');

/**
 * POST /admin/login
 * Login admin dengan email dan password
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await loginAdmin(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    if (error.message === 'Invalid email or password' || error.message === 'User is not an admin') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * GET /admin/me
 * Get current admin profile (requires authentication)
 */
const getMe = async (req, res, next) => {
  try {
    const admin = await getAdminProfile(req.user.id);

    res.json({
      success: true,
      data: {
        user: admin
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getMe
};
