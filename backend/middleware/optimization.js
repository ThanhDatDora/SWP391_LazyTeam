import express from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import compression from 'compression';
import helmet from 'helmet';

// Rate limiting configurations
const rateLimitConfigs = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  }),

  // Strict rate limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth attempts per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
  }),

  // API endpoints rate limit
  api: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 API requests per minute
    message: {
      error: 'API rate limit exceeded, please slow down.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // File upload rate limit
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 uploads per hour
    message: {
      error: 'Upload limit exceeded, please try again later.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Search rate limit
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 searches per minute
    message: {
      error: 'Search rate limit exceeded, please slow down.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Payment endpoints - very strict
  payment: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 payment attempts per hour
    message: {
      error: 'Payment attempt limit exceeded, please contact support.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
};

// Slow down configurations
const slowDownConfigs = {
  // General slow down after rate limit threshold
  general: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 500, // Allow 500 requests per windowMs without delay
    delayMs: () => 100, // Add 100ms delay per request after delayAfter (new v2 format)
    maxDelayMs: 2000, // Maximum delay of 2 seconds
    validate: { delayMs: false } // Disable warning
  }),

  // API slow down
  api: slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 50, // Allow 50 requests per minute without delay
    delayMs: () => 50, // Add 50ms delay per request after delayAfter (new v2 format)
    maxDelayMs: 1000, // Maximum delay of 1 second
    validate: { delayMs: false } // Disable warning
  })
};

// Compression configuration
const compressionConfig = compression({
  // Compress responses with these content types
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Compression level (0-9, where 9 is best compression but slowest)
  level: 6,
  // Minimum response size to compress (in bytes)
  threshold: 1024,
  // Compression algorithms in order of preference
  // gzip, deflate, br (brotli)
  chunkSize: 16 * 1024 // 16KB chunks
});

// Security headers configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ['https://js.stripe.com']
    }
  },
  crossOriginEmbedderPolicy: false // Disable for now due to compatibility
});

// Response caching middleware
const cacheControl = (duration = '1h') => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${parseDuration(duration)}`);
    }
    next();
  };
};

// Parse duration string to seconds
const parseDuration = (duration) => {
  const units = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };
  
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {return 3600;} // Default 1 hour
  
  const [, amount, unit] = match;
  return parseInt(amount) * (units[unit] || 1);
};

// Request size limiting middleware
const requestSizeLimit = (limit = '10mb') => {
  return express.json({ limit });
};

// API response formatting middleware
const apiResponse = (req, res, next) => {
  // Add response formatting helper
  res.apiSuccess = (data, message = 'Success') => {
    res.json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  res.apiError = (error, statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      error: error.message || error,
      timestamp: new Date().toISOString()
    });
  };

  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  
  next();
};

// Health check middleware
const healthCheck = (req, res, next) => {
  if (req.path === '/health' || req.path === '/api/health') {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  }
  next();
};

// CORS configuration
const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

export {
  rateLimitConfigs,
  slowDownConfigs,
  compressionConfig,
  helmetConfig,
  cacheControl,
  requestSizeLimit,
  apiResponse,
  requestLogger,
  healthCheck,
  corsConfig
};