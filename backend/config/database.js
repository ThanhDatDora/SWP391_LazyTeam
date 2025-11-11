import sql from 'mssql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SQL Server configuration
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false, // Use encryption (set to false for local development)
    trustServerCertificate: true, // Trust self-signed certificates
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

export const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to SQL Server...');
    console.log('📊 Connection config:', {
      server: config.server,
      database: config.database,
      user: config.user,
      password: config.password ? '***' : 'NOT SET'
    });
    
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config).connect();
    }
    
    const pool = await poolPromise;
    console.log('📚 Connected to SQL Server database successfully!');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Check your database configuration in .env file');
    throw error;
  }
};

export const getPool = async () => {
  if (!poolPromise) {
    await connectDB();
  }
  return await poolPromise;
};

export { sql };