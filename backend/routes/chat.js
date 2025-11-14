import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { connectDB } from '../config/database.js';
import sql from 'mssql';

const router = express.Router();

// ===== CONVERSATIONS =====

/**
 * GET /api/chat/conversations
 * Get all conversations for current user
 * - Instructor: Get their own conversations
 * - Admin: Get all active conversations or assigned to them
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    
    console.log('📋 Fetching conversations for user:', userId, 'role:', roleId);
    
    let query = `
      SELECT 
        c.conversation_id,
        c.instructor_id,
        c.admin_id,
        c.status,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        instructor.full_name as instructor_name,
        instructor.email as instructor_email,
        admin.full_name as admin_name,
        admin.email as admin_email,
        (SELECT COUNT(*) FROM chat_messages 
         WHERE conversation_id = c.conversation_id 
         AND sender_id != @userId AND is_read = 0) as unread_count,
        (SELECT TOP 1 message_text FROM chat_messages 
         WHERE conversation_id = c.conversation_id 
         ORDER BY created_at DESC) as last_message
      FROM conversations c
      LEFT JOIN users instructor ON c.instructor_id = instructor.user_id
      LEFT JOIN users admin ON c.admin_id = admin.user_id
      WHERE 1=1
    `;
    
    // Filter based on role
    if (roleId === 2) { // Instructor
      query += ` AND c.instructor_id = @userId`;
    } else if (roleId === 3) { // Admin
      query += ` AND (c.admin_id = @userId OR c.admin_id IS NULL OR c.status = 'active')`;
    } else {
      return res.status(403).json({ 
        success: false, 
        error: 'Only instructors and admins can access conversations' 
      });
    }
    
    query += ` ORDER BY c.last_message_at DESC`;
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(query);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/chat/conversations
 * Create a new conversation (Instructor only)
 */
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const instructorId = req.user.userId;
    const roleId = req.user.roleId;
    
    // Only instructors can create conversations
    if (roleId !== 2) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only instructors can create conversations' 
      });
    }
    
    console.log('💬 Creating conversation for instructor:', instructorId);
    
    // Check if active conversation already exists
    const existing = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        SELECT conversation_id FROM conversations 
        WHERE instructor_id = @instructorId AND status = 'active'
      `);
    
    if (existing.recordset.length > 0) {
      console.log('ℹ️ Active conversation already exists');
      return res.json({
        success: true,
        data: { 
          conversation_id: existing.recordset[0].conversation_id,
          existed: true
        }
      });
    }
    
    // Create new conversation
    const result = await pool.request()
      .input('instructorId', sql.BigInt, instructorId)
      .query(`
        INSERT INTO conversations (instructor_id, status)
        OUTPUT INSERTED.conversation_id, INSERTED.created_at
        VALUES (@instructorId, 'active')
      `);
    
    console.log('✅ Conversation created:', result.recordset[0].conversation_id);
    
    res.status(201).json({
      success: true,
      data: { 
        conversation_id: result.recordset[0].conversation_id,
        created_at: result.recordset[0].created_at,
        existed: false
      }
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/chat/conversations/:id/assign
 * Admin assigns conversation to themselves
 */
router.put('/conversations/:id/assign', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const adminId = req.user.userId;
    const roleId = req.user.roleId;
    const conversationId = req.params.id;
    
    if (roleId !== 3) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can assign conversations' 
      });
    }
    
    console.log('👤 Admin', adminId, 'assigning conversation', conversationId);
    
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('adminId', sql.BigInt, adminId)
      .query(`
        UPDATE conversations 
        SET admin_id = @adminId, updated_at = GETDATE()
        WHERE conversation_id = @conversationId
      `);
    
    console.log('✅ Conversation assigned');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error assigning conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/chat/conversations/:id/close
 * Close a conversation
 */
router.put('/conversations/:id/close', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    const conversationId = req.params.id;
    
    // Only admin or the instructor can close
    if (roleId !== 3 && roleId !== 2) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }
    
    // Verify user has access
    const access = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT conversation_id FROM conversations 
        WHERE conversation_id = @conversationId 
        AND (instructor_id = @userId OR admin_id = @userId)
      `);
    
    if (access.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
    
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .query(`
        UPDATE conversations 
        SET status = 'closed', updated_at = GETDATE()
        WHERE conversation_id = @conversationId
      `);
    
    console.log('✅ Conversation closed:', conversationId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error closing conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== MESSAGES =====

/**
 * GET /api/chat/conversations/:id/messages
 * Get all messages in a conversation
 */
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const conversationId = req.params.id;
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;
    
    console.log('📨 Fetching messages for conversation:', conversationId);
    
    // Verify user has access to this conversation
    const access = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT conversation_id FROM conversations 
        WHERE conversation_id = @conversationId 
        AND (instructor_id = @userId OR admin_id = @userId)
      `);
    
    if (access.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied to this conversation' 
      });
    }
    
    const messages = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('limit', sql.Int, parseInt(limit))
      .input('offset', sql.Int, parseInt(offset))
      .query(`
        SELECT 
          m.message_id,
          m.conversation_id,
          m.sender_id,
          m.message_text,
          m.message_type,
          m.file_url,
          m.is_read,
          m.is_edited,
          m.created_at,
          m.updated_at,
          u.full_name as sender_name,
          u.email as sender_email,
          r.role_name as sender_role
        FROM chat_messages m
        LEFT JOIN users u ON m.sender_id = u.user_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE m.conversation_id = @conversationId
        ORDER BY m.created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);
    
    // Mark messages as read
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, userId)
      .query(`
        UPDATE chat_messages 
        SET is_read = 1 
        WHERE conversation_id = @conversationId 
        AND sender_id != @userId 
        AND is_read = 0
      `);
    
    console.log('✅ Fetched', messages.recordset.length, 'messages');
    
    res.json({
      success: true,
      data: messages.recordset.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message in a conversation
 */
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const conversationId = req.params.id;
    const senderId = req.user.userId;
    const { message_text, message_type = 'text', file_url = null } = req.body;
    
    if (!message_text || !message_text.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message text is required' 
      });
    }
    
    console.log('💬 Sending message in conversation:', conversationId);
    
    // Verify user has access
    const access = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('userId', sql.BigInt, senderId)
      .query(`
        SELECT conversation_id FROM conversations 
        WHERE conversation_id = @conversationId 
        AND (instructor_id = @userId OR admin_id = @userId)
      `);
    
    if (access.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied to this conversation' 
      });
    }
    
    // Insert message
    const result = await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .input('senderId', sql.BigInt, senderId)
      .input('messageText', sql.NVarChar, message_text.trim())
      .input('messageType', sql.NVarChar, message_type)
      .input('fileUrl', sql.NVarChar, file_url)
      .query(`
        INSERT INTO chat_messages 
        (conversation_id, sender_id, message_text, message_type, file_url)
        OUTPUT INSERTED.*
        VALUES (@conversationId, @senderId, @messageText, @messageType, @fileUrl)
      `);
    
    // Update conversation last_message_at
    await pool.request()
      .input('conversationId', sql.BigInt, conversationId)
      .query(`
        UPDATE conversations 
        SET last_message_at = GETDATE(), updated_at = GETDATE()
        WHERE conversation_id = @conversationId
      `);
    
    const message = result.recordset[0];
    
    // Get sender info
    const sender = await pool.request()
      .input('senderId', sql.BigInt, senderId)
      .query(`
        SELECT u.full_name, u.email, r.role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = @senderId
      `);
    
    const messageData = {
      ...message,
      sender_name: sender.recordset[0].full_name,
      sender_email: sender.recordset[0].email,
      sender_role: sender.recordset[0].role_name
    };
    
    console.log('✅ Message sent:', message.message_id);
    
    // Emit WebSocket event (will be handled by WebSocketService)
    if (global.websocketService) {
      global.websocketService.emitNewChatMessage(conversationId, messageData);
    }
    
    res.status(201).json({
      success: true,
      data: messageData
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/chat/unread-count
 * Get total unread message count for current user
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) as unread_count
        FROM chat_messages m
        INNER JOIN conversations c ON m.conversation_id = c.conversation_id
        WHERE m.sender_id != @userId 
        AND m.is_read = 0
        AND (c.instructor_id = @userId OR c.admin_id = @userId)
      `);
    
    res.json({
      success: true,
      data: { unread_count: result.recordset[0].unread_count }
    });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
