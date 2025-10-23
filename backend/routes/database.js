import express from 'express';
import { getPool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database with schema
router.post('/init-database', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL into individual statements (basic splitting)
    const statements = schemaSQL
      .split(/GO\s*\n/gi)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    const results = [];
    
    for (const statement of statements) {
      try {
        if (statement.includes('CREATE TABLE') || 
            statement.includes('INSERT INTO') || 
            statement.includes('DROP TABLE') ||
            statement.includes('PRINT')) {
          
          const result = await pool.request().query(statement);
          results.push({
            statement: statement.substring(0, 50) + '...',
            success: true,
            rowsAffected: result.rowsAffected
          });
        }
      } catch (error) {
        console.log(`Warning: ${error.message}`);
        results.push({
          statement: statement.substring(0, 50) + '...',
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Database initialization completed',
      results,
      totalStatements: statements.length
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      message: 'Failed to initialize database',
      error: error.message
    });
  }
});

// Check database status
router.get('/status', async (req, res) => {
  try {
    const pool = await getPool();
    
    // Check if tables exist
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    const tables = result.recordset.map(row => row.TABLE_NAME);
    
    res.json({
      connected: true,
      database: process.env.DB_NAME,
      server: process.env.DB_SERVER,
      tables,
      tableCount: tables.length
    });
    
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

export default router;