import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';
import { createServer } from 'http';
import { validateBackendEnvironment } from './config/envValidator.js';

// Load environment variables first
dotenv.config();

// Validate environment before starting
console.log('🔍 Validating environment configuration...');
try {
  validateBackendEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Import enhanced middleware
import { 
  globalErrorHandler, 
  notFoundHandler, 
  asyncHandler 
} from './middleware/errorHandler.js';

// Import WebSocket service
import WebSocketService from './services/websocketService.js';

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import databaseRoutes from './routes/database.js';
import notificationsRoutes from './routes/notifications.js';
import checkoutRoutes from './routes/checkout.js';
import adminRoutes from './routes/admin.js';
import adminRevenueRoutes from './routes/admin-revenue.js';
import instructorRoutes from './routes/instructor.js';
import enrollmentRoutes from './routes/enrollments.js';
import quizRoutes from './routes/quizzes.js';
import examRoutes from './routes/exams.js';
import newExamRoutes from './routes/new-exam-routes.js';
import assignmentsRoutes from './routes/assignments.js';
import questionBankRoutes from './routes/question-bank.js';
import webhookRoutes from './routes/webhook.js';
import vnpayRoutes from './routes/vnpay.js';
import sepayRoutes from './routes/sepay.routes.js';
import payosRoutes from './routes/payos.js';
import payosDevRoutes from './routes/payos-dev.js';

// Load environment variables
dotenv.config();

console.log('🔍 Environment variables loaded:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL
});

// Add timestamp to force restart
console.log('🕒 Server start time:', new Date().toISOString());

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: {
    success: false,
    error: {
      type: 'RATE_LIMIT_ERROR',
      code: 9003,
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased limit for development
  message: {
    success: false,
    error: {
      type: 'RATE_LIMIT_ERROR',
      code: 9003,
      message: 'Too many authentication attempts, please try again later'
    }
  }
});

app.use('/api/auth/', authLimiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174', // Alternative port
    'http://localhost:5175', // Another alternative
    'http://localhost:5176'  // Another alternative
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, authorization, X-Requested-With, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  req.id = Math.random().toString(36).substring(7);
  
  // Log request (only in development or if LOG_LEVEL is debug)
  if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
    console.log(`📥 [${req.id}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  }
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.log(`📤 [${req.id}] ${statusEmoji} ${status} - ${duration}ms`);
    }
  });
  
  next();
});

// Debug middleware for auth routes ONLY
app.use('/api/auth', (req, res, next) => {
  console.log('\n🔍 === AUTH ROUTE DEBUG ===');
  console.log('🔍 Method:', req.method);
  console.log('🔍 URL:', req.url);
  console.log('🔍 Headers:', req.headers);
  console.log('🔍 Body:', req.body);
  console.log('🔍 Body type:', typeof req.body);
  console.log('🔍 Body keys:', Object.keys(req.body || {}));
  console.log('🔍 Raw body length:', req.rawBody ? req.rawBody.length : 'N/A');
  if (req.rawBody) {
    console.log('🔍 Raw body string:', req.rawBody.toString());
  }
  console.log('🔍 === END DEBUG ===\n');
  next();
});

// Serve static files for testing
app.use(express.static('.'));

// Serve uploaded files (avatars)
app.use('/uploads', express.static('uploads'));

// Optional: Auth route debugging (only in development with DEBUG_AUTH=true)
if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AUTH === 'true') {
  app.use('/api/auth', (req, res, next) => {
    console.log('\n🔍 === AUTH ROUTE DEBUG ===');
    console.log('🔍 Method:', req.method);
    console.log('🔍 URL:', req.url);
    console.log('🔍 Headers:', req.headers);
    console.log('🔍 Body:', req.body);
    console.log('🔍 === END DEBUG ===\n');
    next();
  });
}

// Health check route
app.get('/api/health', asyncHandler(async (req, res) => {
  const dbStatus = await connectDB().then(() => 'connected').catch(() => 'disconnected');
  
  res.json({ 
    success: true,
    data: {
      message: 'Mini Coursera Backend is running!', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
}));

// API status endpoint
app.get('/api/status', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'online',
      timestamp: new Date().toISOString(),
      routes: [
        '/api/health',
        '/api/status', 
        '/api/auth/*',
        '/api/courses/*',
        '/api/database/*'
      ]
    }
  });
}));

// API Routes
app.use('/api/webhook', webhookRoutes); // MUST be before other routes (no auth)
app.use('/api/vnpay', vnpayRoutes); // VNPay payment gateway (public routes)
console.log('✅ VNPay routes registered at /api/vnpay');
app.use('/api/payment/sepay', sepayRoutes); // SePay payment gateway (QR Code Banking)
console.log('✅ SePay routes registered at /api/payment/sepay');
app.use('/api/payment/payos', payosRoutes); // PayOS payment gateway (QR Code Banking)
console.log('✅ PayOS routes registered at /api/payment/payos');

// Development routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/payment/payos/dev', payosDevRoutes); // PayOS dev tools
  console.log('🧪 PayOS DEV routes registered at /api/payment/payos/dev');
}

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-revenue', adminRevenueRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/learning/exams', newExamRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/question-bank', questionBankRoutes);

// 404 handler for API routes (must be before global error handler)
app.use('/api/*', notFoundHandler);

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

// Catch-all 404 handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: {
      type: 'NOT_FOUND_ERROR',
      code: 3001,
      message: `Route ${req.originalUrl} not found`
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it doesn't work
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
    } catch {
      console.log('⚠️  Database connection failed, but server will still start');
      console.log('💡 You can fix database config later');
      console.log('🔧 Update backend/.env with your SQL Server details');
    }
    
    console.log(`🔧 Starting server on PORT: ${PORT}`);
    console.log(`🔧 PORT type: ${typeof PORT}`);
    
    // Create HTTP server for both Express and Socket.IO
    const server = createServer(app);
    
    // Initialize WebSocket service
    const wsService = new WebSocketService(server);
    
    // Make WebSocket service available to routes
    app.locals.wsService = wsService;
    
    server.listen(PORT, '127.0.0.1', (error) => {
      if (error) {
        console.error('❌ Failed to bind port:', error);
        return;
      }
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`� WebSocket server is running on ws://localhost:${PORT}`);
      console.log(`�📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Server listening on localhost (127.0.0.1:${PORT})`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.log(`💡 Port ${PORT} is already in use. Try a different port.`);
        console.log(`💡 Or kill the process: netstat -ano | findstr :${PORT}`);
      }
      process.exit(1);
    });
    
    server.on('listening', () => {
      console.log(`🎯 Server confirmed listening on port ${server.address().port}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
