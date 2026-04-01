const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'user') => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
