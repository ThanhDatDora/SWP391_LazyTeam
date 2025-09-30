import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 2 }),
  body('role').optional().isIn(['learner', 'instructor'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { email, password, fullName, role = 'learner' } = req.body;

    const pool = await getPool();

    // Check if user already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT user_id FROM users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get role_id from role name
    const roleMapping = { 'admin': 1, 'instructor': 2, 'learner': 3 };
    const roleId = roleMapping[role] || 3;

    // Create new user
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, hashedPassword)
      .input('full_name', sql.NVarChar, fullName)
      .input('role_id', sql.SmallInt, roleId)
      .query(`
        INSERT INTO users (email, password_hash, full_name, role_id, status, created_at)
        OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.full_name, INSERTED.role_id
        VALUES (@email, @password_hash, @full_name, @role_id, 'active', GETDATE())
      `);

    const newUser = result.recordset[0];

    // Generate token
    const token = generateToken(newUser.user_id, newUser.email, role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.user_id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    const pool = await getPool();

    // Find user by email with role name
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.user_id, u.email, u.password_hash, u.full_name, u.status, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.recordset[0];

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password - support both bcrypt and SHA-256 legacy hashes
    let isValidPassword = false;
    
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      // bcrypt hash
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy SHA-256 hash (hex format)
      const sha256Hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
      isValidPassword = (sha256Hash === user.password_hash.toUpperCase());
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.user_id, user.email, user.role_name);

    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role_name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        SELECT u.user_id, u.email, u.full_name, r.role_name, u.created_at
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.recordset[0];
    res.json({ 
      user: {
        id: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role_name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('fullName').optional().trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { fullName } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .input('fullName', sql.NVarChar, fullName)
      .query(`
        UPDATE users 
        SET full_name = COALESCE(@fullName, full_name)
        OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.full_name
        WHERE user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = result.recordset[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.user_id,
        email: updatedUser.email,
        fullName: updatedUser.full_name
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;