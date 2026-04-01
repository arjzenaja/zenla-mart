const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/user.service');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a token.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: error.message
    });
  }
};



const authenticateOptional = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    
    const user = await getUserById(decoded.userId);
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid or expired, just proceed without user (public view)
    next();
  }
};

module.exports = { authenticate, authenticateOptional };
