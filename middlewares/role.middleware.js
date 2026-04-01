const { authenticate } = require('./auth.middleware');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Combine authenticate and authorize
const requireAuth = (roles = []) => {
  return [
    authenticate,
    roles.length > 0 ? authorize(...roles) : (req, res, next) => next()
  ];
};

module.exports = { authorize, requireAuth };
