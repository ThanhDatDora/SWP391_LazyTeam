import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002; // Use different port to avoid conflicts

// Enable CORS
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('✅ Received test request!');
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Health endpoint
app.get('/health', (req, res) => {
  console.log('✅ Received health check!');
  res.json({ status: 'ok' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);
  console.log(`Try: http://127.0.0.1:${PORT}/test`);
  console.log(`Try: http://127.0.0.1:${PORT}/health`);
});
