/**
 * Security Middleware
 * Rekomendasi middleware untuk meningkatkan keamanan API
 * 
 * Install dependencies terlebih dahulu:
 * npm install express-validator express-rate-limit helmet
 */

// ============================================
// 1. RATE LIMITING
// ============================================
// Install: npm install express-rate-limit
/*
const rateLimit = require('express-rate-limit');

// Rate limit untuk login (mencegah brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit untuk API umum
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
*/

// ============================================
// 2. HELMET (Security Headers)
// ============================================
// Install: npm install helmet
/*
const helmet = require('helmet');

// Tambahkan di app.js:
// app.use(helmet());

// Atau dengan konfigurasi custom:
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = helmetConfig;
*/

// ============================================
// 3. INPUT SANITIZATION
// ============================================
// Install: npm install express-validator
/*
const { body, validationResult } = require('express-validator');

// Validasi untuk create product
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters')
    .escape(), // Sanitize untuk mencegah XSS
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isUUID().withMessage('Category ID must be a valid UUID'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description too long')
    .escape(),
  
  // Middleware untuk handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateProduct
};
*/

// ============================================
// 4. FILE UPLOAD VALIDATION
// ============================================
/*
const multer = require('multer');
const path = require('path');

// Validasi file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Konfigurasi multer dengan validasi
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Rename file untuk menghindari path traversal
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `image-${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
*/

// ============================================
// 5. REQUEST LOGGING (untuk security monitoring)
// ============================================
/*
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log untuk security events
  if (req.path.includes('/auth/login') || req.path.includes('/admin/login')) {
    console.log(`[SECURITY] Login attempt from IP: ${req.ip}`);
  }
  
  next();
};

module.exports = requestLogger;
*/

// ============================================
// 6. ERROR HANDLING (tidak expose sensitive info)
// ============================================
/*
const secureErrorHandler = (err, req, res, next) => {
  // Jangan expose error details di production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
  
  // Development: show full error
  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
};

module.exports = secureErrorHandler;
*/

// Placeholder export
module.exports = {};
