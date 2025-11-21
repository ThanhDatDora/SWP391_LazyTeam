import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error(`💡 Please create backend/.env file from .env.template`);
  console.error(`💡 Copy: cp backend/.env.template backend/.env`);
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  } else {
    console.warn('⚠️  Continuing with default values for development...');
  }
}

// SQL Server configuration
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MiniCourseraDB',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000')
  }
};

let poolPromise;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

export const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to SQL Server...');
    console.log('📊 Connection config:', {
      server: config.server,
      database: config.database,
      user: config.user,
      port: config.port,
      poolMax: config.pool.max,
      password: config.password ? '***' : 'NOT SET'
    });
    
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config).connect();
    }
    
    const pool = await poolPromise;
    connectionAttempts = 0; // Reset counter on success
    console.log('✅ Connected to SQL Server database successfully!');
    return pool;
  } catch (error) {
    console.error(`❌ Database connection failed (attempt ${connectionAttempts + 1}/${MAX_RETRIES}):`, error.message);
    
    poolPromise = null; // Reset pool promise to allow retry
    
    if (connectionAttempts < MAX_RETRIES) {
      connectionAttempts++;
      console.log(`🔄 Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(); // Recursive retry
    }
    
    console.error('💡 Check your database configuration in backend/.env file');
    console.error('💡 Ensure SQL Server is running and accessible');
    console.error('💡 Verify credentials and network connectivity');
    throw error;
  }
};

export const getPool = async () => {
  if (!poolPromise) {
    await connectDB();
  }
  return await poolPromise;
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing database connections...');
  if (poolPromise) {
    try {
      const pool = await poolPromise;
      await pool.close();
      console.log('✅ Database connections closed gracefully');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing database connections...');
  if (poolPromise) {
    try {
      const pool = await poolPromise;
      await pool.close();
      console.log('✅ Database connections closed gracefully');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }
  process.exit(0);
});

export { sql };