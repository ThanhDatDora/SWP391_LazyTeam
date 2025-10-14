import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('🩺 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test route
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ message: 'Test endpoint working!', port: PORT });
});

// Catch all
app.get('*', (req, res) => {
  console.log(`📡 Request to: ${req.path}`);
  res.json({ message: 'Route not found', path: req.path });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server listening on all interfaces`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});