import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔑 authenticateToken - Request:', req.method, req.path);
  console.log('🔑 authHeader:', authHeader ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    
    // Get user from database to ensure they still exist and are active
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.BigInt, decoded.userId)
      .query(`
        SELECT u.user_id, u.email, u.full_name, r.role_name, r.role_id, u.status 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = @userId AND u.status = 'active'
      `);

    console.log('📊 Database query result:', result.recordset);

    if (result.recordset.length === 0) {
      console.log('❌ User not found or inactive');
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const user = result.recordset[0];
    req.user = {
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role_name,
      roleId: user.role_id
    };
    console.log('✅ req.user set:', req.user);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
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