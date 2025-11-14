import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Import optimization middleware
import {
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
} from './middleware/optimization.js';

// Import services
import { cacheService } from './services/cacheService.js';
import { queryOptimizer } from './services/queryOptimizer.js';

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Health check (before any other middleware)
app.use(healthCheck);

// Security headers
app.use(helmetConfig);

// CORS configuration
app.use(cors(corsConfig));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Compression
app.use(compressionConfig);

// Rate limiting and slow down
app.use(rateLimitConfigs.general);
app.use(slowDownConfigs.general);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API response helpers
app.use(apiResponse);

// Static files with caching
app.use('/uploads', cacheControl('1d'), express.static('uploads'));

// API routes with specific rate limiting
app.use('/api/auth', rateLimitConfigs.auth);
app.use('/api/payments', rateLimitConfigs.payment);
app.use('/api/search', rateLimitConfigs.search);
app.use('/api/upload', rateLimitConfigs.upload);
app.use('/api', rateLimitConfigs.api, slowDownConfigs.api);

// Import route handlers
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import adminRoutes from './routes/admin.js';
import adminRevenueRoutes from './routes/admin-revenue.js';
import chatRoutes from './routes/chat.js';
// TODO: Create these route files when needed
// import userRoutes from './routes/users.js';
// import enrollmentRoutes from './routes/enrollments.js';
// import paymentRoutes from './routes/payments.js';
// import uploadRoutes from './routes/upload.js';
// import analyticsRoutes from './routes/analytics.js';
// import notificationRoutes from './routes/notifications.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRevenueRoutes);
app.use('/api/chat', chatRoutes);
// TODO: Uncomment when route files are created
// app.use('/api/users', userRoutes);
// app.use('/api/enrollments', enrollmentRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/notifications', notificationRoutes);

// Optimized endpoints with caching
app.get('/api/courses/popular', cacheService.middleware(3600), async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const courses = await queryOptimizer.getPopularCourses(category, parseInt(limit));
    res.apiSuccess(courses);
  } catch (error) {
    res.apiError(error);
  }
});

app.get('/api/users/:userId/dashboard', cacheService.middleware(300), async (req, res) => {
  try {
    const { userId } = req.params;
    const dashboard = await queryOptimizer.getUserDashboard(parseInt(userId));
    res.apiSuccess(dashboard);
  } catch (error) {
    res.apiError(error);
  }
});

app.get('/api/search/courses', cacheService.middleware(600), async (req, res) => {
  try {
    const searchOptions = {
      searchTerm: req.query.q,
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      level: req.query.level,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : null,
      offset: parseInt(req.query.offset) || 0,
      limit: parseInt(req.query.limit) || 20
    };

    const results = await queryOptimizer.searchCourses(searchOptions);
    res.apiSuccess(results);
  } catch (error) {
    res.apiError(error);
  }
});

// Performance and monitoring endpoints
app.get('/api/performance/metrics', async (req, res) => {
  try {
    const metrics = await queryOptimizer.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    res.apiError(error);
  }
});

app.get('/api/performance/cache-stats', (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json(stats);
  } catch (error) {
    res.apiError(error);
  }
});

// Cache management endpoints (admin only)
app.post('/api/admin/cache/clear', async (req, res) => {
  try {
    // Add admin authentication middleware here
    await cacheService.clear();
    res.apiSuccess(null, 'Cache cleared successfully');
  } catch (error) {
    res.apiError(error);
  }
});

app.delete('/api/admin/cache/:pattern', async (req, res) => {
  try {
    // Add admin authentication middleware here
    const { pattern } = req.params;
    await cacheService.invalidatePattern(pattern);
    res.apiSuccess(null, `Cache pattern '${pattern}' invalidated`);
  } catch (error) {
    res.apiError(error);
  }
});

// Database maintenance endpoint (admin only)
app.post('/api/admin/maintenance/run', async (req, res) => {
  try {
    // Add admin authentication middleware here
    await queryOptimizer.runMaintenance();
    res.apiSuccess(null, 'Database maintenance completed');
  } catch (error) {
    res.apiError(error);
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  try {
    const metrics = queryOptimizer.getQueryStats();
    const cacheStats = cacheService.getStats();
    
    // Format metrics for Prometheus
    let output = '';
    
    // Query metrics
    Object.entries(metrics).forEach(([queryName, stats]) => {
      output += `# HELP query_cache_hit_rate Cache hit rate for query ${queryName}\n`;
      output += '# TYPE query_cache_hit_rate gauge\n';
      output += `query_cache_hit_rate{query="${queryName}"} ${stats.hitRate}\n`;
      
      output += `# HELP query_execution_time Average execution time for query ${queryName}\n`;
      output += '# TYPE query_execution_time gauge\n';
      output += `query_execution_time{query="${queryName}"} ${stats.averageExecutionTime}\n`;
    });
    
    // Cache metrics
    output += '# HELP cache_memory_keys Number of keys in memory cache\n';
    output += '# TYPE cache_memory_keys gauge\n';
    output += `cache_memory_keys ${cacheStats.memory.keys}\n`;
    
    output += '# HELP cache_redis_connected Redis connection status\n';
    output += '# TYPE cache_redis_connected gauge\n';
    output += `cache_redis_connected ${cacheStats.redis.connected ? 1 : 0}\n`;
    
    res.set('Content-Type', 'text/plain');
    res.send(output);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const error = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(err.status || 500).json({
    success: false,
    error,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await cacheService.close();
    console.log('Cache service closed');
    
    // Close other services as needed
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    await cacheService.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📊 Performance monitoring available at /api/performance/metrics');
  console.log('🏥 Health check available at /health');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📈 Prometheus metrics available at /metrics');
  }
});

// Initialize WebSocket service
import WebSocketService from './services/websocketService.js';
const websocketService = new WebSocketService(server);

// Make websocket service globally available for chat routes
global.websocketService = websocketService;

console.log('✅ WebSocket service initialized for chat');

export default app;