import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import databaseRoutes from './routes/database.js';

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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for testing
app.use(express.static('.'));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Mini Coursera Backend is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/database', databaseRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/exams', examRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it doesn't work
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.log('⚠️  Database connection failed, but server will still start');
      console.log('💡 You can fix database config later');
      console.log('🔧 Update backend/.env with your SQL Server details');
    }
    
    console.log(`🔧 Starting server on PORT: ${PORT}`);
    console.log(`🔧 PORT type: ${typeof PORT}`);
    
    const server = app.listen(PORT, '0.0.0.0', (error) => {
      if (error) {
        console.error('❌ Failed to bind port:', error);
        return;
      }
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Server listening on all interfaces (0.0.0.0:${PORT})`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.log(`💡 Port ${PORT} is already in use. Try a different port.`);
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