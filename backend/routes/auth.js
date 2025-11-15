import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';
import GoogleAuthService from '../services/googleAuthService.js';
import OTPService from '../services/otpService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Initialize services
const googleAuthService = new GoogleAuthService();
const otpService = new OTPService();

// Multer configuration for avatar upload
const uploadDir = './uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to generate JWT token
const generateToken = (userId, email, role) => {
  // Admin (role_id = 1) gets 7 days, others get 24 hours
  const expiresIn = role === 1 ? '7d' : '24h';
  
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Register new user
router.post('/register', [
  body('email').isEmail().trim(),
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
  body('email').isEmail().trim(),
  body('password').notEmpty().trim()
], async (req, res) => {
  try {
    console.log('� === LOGIN REQUEST DEBUG ===');
    console.log('📥 Raw request body:', req.body);
    console.log('📥 Body type:', typeof req.body);
    console.log('📥 Body keys:', Object.keys(req.body || {}));
    console.log('📥 Content-Type:', req.headers['content-type']);
    console.log('📥 Request method:', req.method);
    console.log('📥 Request URL:', req.url);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      console.log('🔍 Each validation error:');
      errors.array().forEach((error, index) => {
        console.log(`  ${index + 1}. Field: ${error.path}, Value: ${error.value}, Message: ${error.msg}`);
      });
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
        SELECT u.user_id, u.email, u.password_hash, u.full_name, u.status, u.role_id, r.role_name
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

    const responseData = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.user_id,
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          fullName: user.full_name,
          role_id: user.role_id,
          role: user.role_id,  // For compatibility
          role_name: user.role_name,
          roleName: user.role_name
        },
        token
      }
    };
    
    console.log('📤 === LOGIN RESPONSE DEBUG ===');
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    console.log('📤 user.role_id:', user.role_id, typeof user.role_id);
    console.log('📤 === END RESPONSE DEBUG ===');
    
    res.json(responseData);

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
        SELECT 
          u.user_id, u.email, u.full_name, u.phone, u.address, u.bio,
          u.avatar_url, u.date_of_birth, u.gender,
          r.role_name, u.created_at
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
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
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
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ min: 2 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isMobilePhone('any'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']),
  body('dateOfBirth').optional({ checkFalsy: true }).isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { fullName, email, phone, address, bio, gender, dateOfBirth } = req.body;
    const pool = await getPool();

    if (email) {
      const emailCheck = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .input('userId', sql.BigInt, req.user.userId)
        .query('SELECT user_id FROM users WHERE email = @email AND user_id != @userId');
      
      if (emailCheck.recordset.length > 0) {
        return res.status(400).json({ 
          message: 'Email này đã được sử dụng bởi người dùng khác' 
        });
      }
    }

    await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .input('fullName', sql.NVarChar(200), fullName || null)
      .input('email', sql.NVarChar(255), email || null)
      .input('phone', sql.NVarChar(20), phone || null)
      .input('address', sql.NVarChar(500), address || null)
      .input('bio', sql.NVarChar(sql.MAX), bio || null)
      .input('gender', sql.NVarChar(10), gender || null)
      .input('dateOfBirth', sql.Date, dateOfBirth || null)
      .query(`
        UPDATE users 
        SET 
          full_name = COALESCE(@fullName, full_name),
          email = COALESCE(@email, email),
          phone = COALESCE(@phone, phone),
          address = COALESCE(@address, address),
          bio = COALESCE(@bio, bio),
          gender = COALESCE(@gender, gender),
          date_of_birth = COALESCE(@dateOfBirth, date_of_birth),
          updated_at = GETDATE()
        WHERE user_id = @userId
      `);

    // Query updated user data separately
    const result = await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        SELECT user_id, email, full_name, phone, address, bio, 
               avatar_url, date_of_birth, gender
        FROM users 
        WHERE user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification after successful profile update
    try {
      await pool.request()
        .input('userId', sql.BigInt, req.user.userId)
        .query(`
          INSERT INTO notifications (user_id, title, message, type, icon, link)
          VALUES (
            @userId,
            N'Cập nhật thông tin thành công',
            N'Thông tin cá nhân của bạn đã được cập nhật. Cảm ơn bạn đã hoàn thiện profile!',
            'success',
            'CheckCircle',
            '/my-profile'
          )
        `);
    } catch (notifError) {
      // Don't fail the request if notification creation fails
      console.warn('Failed to create notification:', notifError.message);
    }

    const updatedUser = result.recordset[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.user_id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatar_url,
        dateOfBirth: updatedUser.date_of_birth,
        gender: updatedUser.gender
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      number: error.number,
      state: error.state,
      class: error.class,
      lineNumber: error.lineNumber,
      serverName: error.serverName,
      procName: error.procName
    });
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Upload avatar
router.put('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const pool = await getPool();

    // Update user's avatar_url in database
    await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .input('avatarUrl', sql.NVarChar, avatarUrl)
      .query('UPDATE users SET avatar_url = @avatarUrl, updated_at = GETDATE() WHERE user_id = @userId');

    res.json({ 
      success: true, 
      data: { avatarUrl } 
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    // If error occurs, delete uploaded file
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    res.status(500).json({ error: error.message });
  }
});

// Change password (for logged-in users)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    const pool = await getPool();

    // Get current user's password hash
    const userResult = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query('SELECT password_hash FROM users WHERE user_id = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy người dùng' 
      });
    }

    const user = userResult.recordset[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Mật khẩu hiện tại không chính xác' 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('hashedPassword', sql.NVarChar, hashedNewPassword)
      .query('UPDATE users SET password_hash = @hashedPassword, updated_at = GETDATE() WHERE user_id = @userId');

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Có lỗi xảy ra khi đổi mật khẩu' 
    });
  }
});

// ================================
// GOOGLE OAUTH ROUTES
// ================================

// Google OAuth - Get authentication URL
router.get('/google', (req, res) => {
  try {
    // Check if Google OAuth is properly configured
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
      return res.status(400).json({ 
        success: false,
        error: { 
          message: 'Google OAuth chưa được cấu hình. Vui lòng setup Google Cloud Console credentials.',
          details: 'Cần cấu hình GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env'
        }
      });
    }

    const authUrl = googleAuthService.getAuthUrl();
    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to generate Google auth URL' }
    });
  }
});

// Google OAuth - Handle callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=no_authorization_code`);
    }

    // Exchange code for tokens
    const tokens = await googleAuthService.getTokensFromCode(code);
    
    // Get user info
    const userInfo = await googleAuthService.getUserInfo(tokens.access_token);

    if (!userInfo.verified_email) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=email_not_verified`);
    }

    const pool = await getPool();

    // Check if user exists
    let user;
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, userInfo.email)
      .query(`
        SELECT u.user_id, u.email, u.full_name, r.role_name, u.status
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = @email
      `);

    if (existingUser.recordset.length > 0) {
      // User exists - login
      user = existingUser.recordset[0];
      
      if (user.status !== 'active') {
        return res.redirect(`${process.env.FRONTEND_URL}/auth?error=account_deactivated`);
      }
    } else {
      // User doesn't exist - create new account
      const result = await pool.request()
        .input('email', sql.NVarChar, userInfo.email)
        .input('full_name', sql.NVarChar, userInfo.name)
        .input('role_id', sql.SmallInt, 3) // learner role
        .input('google_id', sql.NVarChar, userInfo.id)
        .query(`
          INSERT INTO users (email, full_name, role_id, google_id, status, created_at, email_verified)
          OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.full_name
          VALUES (@email, @full_name, @role_id, @google_id, 'active', GETDATE(), 1)
        `);

      const newUser = result.recordset[0];
      user = {
        user_id: newUser.user_id,
        email: newUser.email,
        full_name: newUser.full_name,
        role_name: 'learner'
      };
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.email, user.role_name);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.user_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role_name
    }))}`);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

// ================================
// OTP REGISTRATION ROUTES
// ================================

// Send OTP for registration
router.post('/register/send-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 2001,
          message: 'Invalid email format'
        }
      });
    }

    const { email } = req.body;
    const pool = await getPool();

    // Check if user already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT user_id FROM users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'CONFLICT_ERROR',
          code: 3002,
          message: 'Email already registered'
        }
      });
    }

    // Send OTP
    const result = await otpService.sendOTPEmail(email, 'registration');

    res.json({
      success: true,
      data: {
        message: 'OTP sent successfully',
        email: email,
        expiresIn: result.expiresIn
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        code: 9001,
        message: 'Failed to send OTP'
      }
    });
  }
});

// Verify OTP and complete registration
router.post('/register/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 2 }),
  body('role').optional().isIn(['learner', 'instructor']),
  // Instructor fields validation
  body('headline').optional().trim().isLength({ max: 500 }),
  body('bio').optional().trim(),
  body('degrees_and_certificates').optional().trim(),
  body('work_history').optional().trim(),
  body('awards').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 2001,
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { 
      email, otp, password, fullName, role = 'learner',
      headline, bio, degrees_and_certificates, work_history, awards
    } = req.body;

    // Validate instructor fields if role is instructor
    if (role === 'instructor') {
      if (!headline || !bio || !degrees_and_certificates || !work_history) {
        return res.status(400).json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            code: 2001,
            message: 'Instructor profile requires headline, bio, degrees_and_certificates, and work_history'
          }
        });
      }
    }

    // Verify OTP
    const otpResult = otpService.verifyOTP(email, otp, 'registration');
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 2001,
          message: otpResult.error,
          attemptsLeft: otpResult.attemptsLeft
        }
      });
    }

    const pool = await getPool();

    // Double-check user doesn't exist
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT user_id FROM users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'CONFLICT_ERROR',
          code: 3002,
          message: 'Email already registered'
        }
      });
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
        INSERT INTO users (email, password_hash, full_name, role_id, status, created_at, email_verified)
        OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.full_name, INSERTED.role_id
        VALUES (@email, @password_hash, @full_name, @role_id, 'active', GETDATE(), 1)
      `);

    const newUser = result.recordset[0];

    // If instructor, create instructor profile
    if (role === 'instructor') {
      await pool.request()
        .input('user_id', sql.BigInt, newUser.user_id)
        .input('headline', sql.NVarChar, headline)
        .input('bio', sql.NText, bio)
        .input('degrees_and_certificates', sql.NText, degrees_and_certificates)
        .input('work_history', sql.NText, work_history)
        .input('awards', sql.NText, awards || null)
        .query(`
          INSERT INTO instructors (user_id, headline, bio, degrees_and_certificates, work_history, awards, created_at)
          VALUES (@user_id, @headline, @bio, @degrees_and_certificates, @work_history, @awards, GETDATE())
        `);
    }

    // Generate token
    const token = generateToken(newUser.user_id, newUser.email, role);

    res.status(201).json({
      success: true,
      data: {
        message: 'Registration completed successfully',
        user: {
          id: newUser.user_id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: role
        },
        token
      }
    });

  } catch (error) {
    console.error('OTP Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        code: 9001,
        message: 'Registration failed'
      }
    });
  }
});

// Resend OTP
router.post('/register/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 2001,
          message: 'Invalid email format'
        }
      });
    }

    const { email } = req.body;

    // Resend OTP with rate limiting
    const result = await otpService.resendOTP(email, 'registration');

    res.json({
      success: true,
      data: {
        message: 'OTP resent successfully',
        email: email,
        expiresIn: result.expiresIn
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    
    if (error.message.includes('wait')) {
      return res.status(429).json({ 
        success: false,
        error: {
          type: 'RATE_LIMIT_ERROR',
          code: 9003,
          message: error.message
        }
      });
    }

    res.status(500).json({ 
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        code: 9001,
        message: 'Failed to resend OTP'
      }
    });
  }
});

// Forgot Password - Send reset token
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 1001,
          message: 'Invalid email format',
          details: errors.array()
        }
      });
    }

    const { email } = req.body;
    const pool = await getPool();

    // Check if user exists
    const userResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT user_id, full_name FROM users WHERE email = @email AND status = \'active\'');

    if (userResult.recordset.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true,
        data: {
          message: 'Nếu email tồn tại, chúng tôi đã gửi link reset mật khẩu đến email của bạn'
        }
      });
    }

    const user = userResult.recordset[0];
    
    // Generate reset token (6 digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Use UTC time to avoid timezone issues
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    console.log('🔑 Creating reset token:', {
      email,
      resetToken,
      currentTimeUTC: now.toISOString(),
      expiresAtUTC: expiresAt.toISOString(),
      currentTimeLocal: now.toLocaleString('vi-VN'),
      expiresAtLocal: expiresAt.toLocaleString('vi-VN'),
      minutesValid: 15
    });

    // Save reset token to database
    await pool.request()
      .input('userId', sql.Int, user.user_id) // Changed from BigInt to Int to match table schema
      .input('resetToken', sql.NVarChar, resetToken)
      .input('expiresAt', sql.DateTime, expiresAt)
      .query(`
        MERGE password_resets AS target
        USING (SELECT @userId as user_id) AS source
        ON (target.user_id = source.user_id)
        WHEN MATCHED THEN 
          UPDATE SET reset_token = @resetToken, expires_at = @expiresAt, created_at = GETDATE(), used = 0
        WHEN NOT MATCHED THEN
          INSERT (user_id, reset_token, expires_at, created_at, used) 
          VALUES (@userId, @resetToken, @expiresAt, GETDATE(), 0);
      `);

    console.log('✅ Reset token saved to database');

    // Send reset email
    const emailResult = await otpService.sendPasswordResetEmail(email, user.full_name, resetToken);
    
    if (!emailResult.success) {
      throw new Error('Failed to send reset email');
    }

    res.json({ 
      success: true,
      data: {
        message: 'Chúng tôi đã gửi mã reset mật khẩu đến email của bạn. Vui lòng kiểm tra email.',
        expiresIn: '15 phút'
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        code: 9001,
        message: 'Không thể gửi email reset mật khẩu'
      }
    });
  }
});

// Reset Password - Verify token and update password
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),  
  body('resetToken').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          code: 1001,
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, resetToken, newPassword } = req.body;
    const pool = await getPool();

    // Debug: Check if token exists first (without time check)
    const debugTokenResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('resetToken', sql.NVarChar, resetToken)
      .query(`
        SELECT pr.user_id, u.full_name, pr.expires_at, pr.created_at, pr.used, 
               GETUTCDATE() as current_db_time_utc,
               DATEDIFF(minute, GETUTCDATE(), pr.expires_at) as minutes_until_expiry
        FROM password_resets pr
        JOIN users u ON pr.user_id = u.user_id
        WHERE u.email = @email 
          AND pr.reset_token = @resetToken
      `);

    console.log('🔍 Debug reset token:', {
      email,
      resetToken,
      found: debugTokenResult.recordset.length > 0,
      tokenData: debugTokenResult.recordset[0] || 'No token found'
    });

    // Verify reset token
    const tokenResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('resetToken', sql.NVarChar, resetToken)
      .query(`
        SELECT pr.user_id, u.full_name, pr.expires_at
        FROM password_resets pr
        JOIN users u ON pr.user_id = u.user_id
        WHERE u.email = @email 
          AND pr.reset_token = @resetToken 
          AND pr.used = 0
          AND pr.expires_at > GETUTCDATE()
      `);

    if (tokenResult.recordset.length === 0) {
      // Provide more specific error message based on debug info
      let errorMessage = 'Mã reset không hợp lệ hoặc đã hết hạn';
      if (debugTokenResult.recordset.length > 0) {
        const debugData = debugTokenResult.recordset[0];
        if (debugData.used === 1) {
          errorMessage = 'Mã reset đã được sử dụng';
        } else if (debugData.minutes_until_expiry <= 0) {
          errorMessage = `Mã reset đã hết hạn ${Math.abs(debugData.minutes_until_expiry)} phút trước`;
        }
      }
      
      return res.status(400).json({ 
        success: false,
        error: {
          type: 'INVALID_TOKEN_ERROR',
          code: 2003,
          message: errorMessage
        }
      });
    }

    const user = tokenResult.recordset[0];

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and mark token as used
    await pool.request()
      .input('userId', sql.Int, user.user_id) // Changed from BigInt to Int to match table schema
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .input('resetToken', sql.NVarChar, resetToken)
      .query(`
        BEGIN TRANSACTION;
        
        UPDATE users 
        SET password_hash = @hashedPassword, updated_at = GETDATE()
        WHERE user_id = @userId;
        
        UPDATE password_resets 
        SET used = 1, used_at = GETDATE()
        WHERE user_id = @userId AND reset_token = @resetToken;
        
        COMMIT TRANSACTION;
      `);

    res.json({ 
      success: true,
      data: {
        message: 'Mật khẩu đã được cập nhật thành công. Bạn có thể đăng nhập với mật khẩu mới.',
        redirectTo: '/auth'
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        code: 9001,
        message: 'Không thể reset mật khẩu'
      }
    });
  }
});

export default router;