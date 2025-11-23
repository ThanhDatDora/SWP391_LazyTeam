/**
 * Enhanced Error Handling Middleware for Backend
 * Provides structured error responses, logging, and monitoring
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error types and codes
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

export const ErrorCodes = {
  // Authentication & Authorization (1000-1999)
  INVALID_CREDENTIALS: 1001,
  TOKEN_EXPIRED: 1002,
  TOKEN_INVALID: 1003,
  INSUFFICIENT_PERMISSIONS: 1004,
  ACCOUNT_DISABLED: 1005,
  
  // Validation (2000-2999)
  REQUIRED_FIELD_MISSING: 2001,
  INVALID_EMAIL_FORMAT: 2002,
  INVALID_PHONE_FORMAT: 2003,
  PASSWORD_TOO_WEAK: 2004,
  INVALID_DATE_FORMAT: 2005,
  
  // Resource Management (3000-3999)
  RESOURCE_NOT_FOUND: 3001,
  RESOURCE_ALREADY_EXISTS: 3002,
  RESOURCE_IN_USE: 3003,
  RESOURCE_LIMIT_EXCEEDED: 3004,
  
  // Course & Enrollment (4000-4999)
  COURSE_NOT_AVAILABLE: 4001,
  ALREADY_ENROLLED: 4002,
  ENROLLMENT_CLOSED: 4003,
  PREREQUISITE_NOT_MET: 4004,
  
  // Database (5000-5999)
  CONNECTION_FAILED: 5001,
  QUERY_TIMEOUT: 5002,
  CONSTRAINT_VIOLATION: 5003,
  TRANSACTION_FAILED: 5004,
  
  // External Services (6000-6999)
  PAYMENT_FAILED: 6001,
  EMAIL_DELIVERY_FAILED: 6002,
  FILE_UPLOAD_FAILED: 6003,
  
  // System (9000-9999)
  INTERNAL_ERROR: 9001,
  SERVICE_UNAVAILABLE: 9002,
  RATE_LIMIT_EXCEEDED: 9003
};

// Custom Error Classes
export class AppError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL_SERVER_ERROR, code = ErrorCodes.INTERNAL_ERROR, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null, value = null) {
    super(message, ErrorTypes.VALIDATION_ERROR, ErrorCodes.REQUIRED_FIELD_MISSING, 400);
    this.field = field;
    this.value = value;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, ErrorTypes.AUTHENTICATION_ERROR, ErrorCodes.INVALID_CREDENTIALS, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, ErrorTypes.AUTHORIZATION_ERROR, ErrorCodes.INSUFFICIENT_PERMISSIONS, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, ErrorTypes.NOT_FOUND_ERROR, ErrorCodes.RESOURCE_NOT_FOUND, 404);
    this.resource = resource;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, ErrorTypes.CONFLICT_ERROR, ErrorCodes.RESOURCE_ALREADY_EXISTS, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, ErrorTypes.DATABASE_ERROR, ErrorCodes.CONNECTION_FAILED, 500);
    this.originalError = originalError;
  }
}

// Error Logger
class ErrorLogger {
  constructor() {
    this.logDirectory = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  formatError(error, request = null) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        type: error.type || ErrorTypes.INTERNAL_SERVER_ERROR,
        code: error.code || ErrorCodes.INTERNAL_ERROR,
        statusCode: error.statusCode || 500,
        stack: error.stack
      },
      request: request ? {
        method: request.method,
        url: request.originalUrl || request.url,
        userAgent: request.get('User-Agent'),
        ip: request.ip || request.connection?.remoteAddress,
        userId: request.user?.userId || null,
        body: this.sanitizeBody(request.body),
        query: request.query
      } : null,
      environment: process.env.NODE_ENV || 'development'
    };

    return errorInfo;
  }

  sanitizeBody(body) {
    if (!body || typeof body !== 'object') {return body;}
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  async logError(error, request = null) {
    const errorInfo = this.formatError(error, request);
    const logEntry = JSON.stringify(errorInfo, null, 2);
    
    // Console log for development
    if (process.env.NODE_ENV !== 'production') {
      console.error('🚨 Application Error:', logEntry);
    }
    
    // File logging
    const filename = `error-${new Date().toISOString().split('T')[0]}.log`;
    const logPath = path.join(this.logDirectory, filename);
    
    try {
      await fs.promises.appendFile(logPath, logEntry + '\n');
    } catch (fileError) {
      console.error('Failed to write error log:', fileError);
    }
    
    // TODO: Send to external logging service (e.g., Sentry, LogRocket)
    // await this.sendToExternalService(errorInfo);
  }

  // Future: Send to external monitoring service
  async sendToExternalService(errorInfo) {
    // Implementation for external logging service
    // e.g., Sentry, DataDog, CloudWatch
  }
}

// Global error logger instance
const errorLogger = new ErrorLogger();

// Error Response Builder
export class ErrorResponse {
  static build(error, request = null) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Default error response
    const response = {
      success: false,
      error: {
        type: ErrorTypes.INTERNAL_SERVER_ERROR,
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error'
      },
      timestamp: new Date().toISOString(),
      path: request?.originalUrl || request?.url
    };

    // Handle known application errors
    if (error instanceof AppError) {
      response.error = {
        type: error.type,
        code: error.code,
        message: error.message,
        ...(error.field && { field: error.field }),
        ...(error.resource && { resource: error.resource })
      };
      response.statusCode = error.statusCode;
    }
    // Handle database errors
    else if (error.name === 'SequelizeError' || error.code?.startsWith('ER_')) {
      response.error = {
        type: ErrorTypes.DATABASE_ERROR,
        code: ErrorCodes.CONNECTION_FAILED,
        message: isDevelopment ? error.message : 'Database operation failed'
      };
      response.statusCode = 500;
    }
    // Handle validation errors from express-validator
    else if (error.name === 'ValidationError' || error.errors?.length) {
      response.error = {
        type: ErrorTypes.VALIDATION_ERROR,
        code: ErrorCodes.REQUIRED_FIELD_MISSING,
        message: 'Validation failed',
        details: error.errors || [error.message]
      };
      response.statusCode = 400;
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      response.error = {
        type: ErrorTypes.AUTHENTICATION_ERROR,
        code: ErrorCodes.TOKEN_INVALID,
        message: 'Invalid authentication token'
      };
      response.statusCode = 401;
    } else if (error.name === 'TokenExpiredError') {
      response.error = {
        type: ErrorTypes.AUTHENTICATION_ERROR,
        code: ErrorCodes.TOKEN_EXPIRED,
        message: 'Authentication token has expired'
      };
      response.statusCode = 401;
    }
    // Handle other known errors
    else {
      // Log unexpected errors
      console.error('Unexpected error:', error);
      
      if (isDevelopment) {
        response.error.message = error.message;
        response.error.stack = error.stack;
      }
      response.statusCode = 500;
    }

    // Add development information
    if (isDevelopment) {
      response.debug = {
        originalError: error.message,
        stack: error.stack,
        ...(request && {
          requestId: request.id,
          method: request.method,
          url: request.originalUrl
        })
      };
    }

    return response;
  }
}

// Global Error Handler Middleware
export const globalErrorHandler = async (error, req, res, next) => {
  // Log the error
  await errorLogger.logError(error, req);
  
  // Build error response
  const errorResponse = ErrorResponse.build(error, req);
  
  // Send response
  res.status(errorResponse.statusCode || 500).json(errorResponse);
};

// Async Error Wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 Handler
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Validation Helper
export const validateRequest = (validationRules) => {
  return async (req, res, next) => {
    try {
      const errors = [];
      
      for (const [field, rules] of Object.entries(validationRules)) {
        const value = req.body[field];
        
        if (rules.required && (!value || value.toString().trim() === '')) {
          errors.push(new ValidationError(`${field} is required`, field, value));
        }
        
        if (value && rules.type) {
          if (rules.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
            errors.push(new ValidationError(`${field} must be a valid email`, field, value));
          }
          
          if (rules.type === 'number' && isNaN(value)) {
            errors.push(new ValidationError(`${field} must be a number`, field, value));
          }
          
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(new ValidationError(`${field} must be at least ${rules.minLength} characters`, field, value));
          }
          
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(new ValidationError(`${field} must not exceed ${rules.maxLength} characters`, field, value));
          }
        }
      }
      
      if (errors.length > 0) {
        const error = new ValidationError('Validation failed');
        error.errors = errors;
        return next(error);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate Limiting Error
export const rateLimitHandler = (req, res, next) => {
  const error = new AppError(
    'Too many requests, please try again later',
    ErrorTypes.RATE_LIMIT_ERROR,
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    429
  );
  next(error);
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ErrorResponse,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  validateRequest,
  rateLimitHandler,
  ErrorTypes,
  ErrorCodes
};