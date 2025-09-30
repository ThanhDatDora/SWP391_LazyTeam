import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.BigInt, decoded.userId)
      .query(`
        SELECT u.user_id, u.email, u.full_name, r.role_name, u.status 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = @userId AND u.status = 'active'
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const user = result.recordset[0];
    req.user = {
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role_name
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};