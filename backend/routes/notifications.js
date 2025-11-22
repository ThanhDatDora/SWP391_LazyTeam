import express from 'express';
import sql from 'mssql';
import { getPool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        SELECT 
          notification_id AS id,
          title,
          message,
          type,
          is_read AS isRead,
          link,
          icon,
          metadata,
          created_at AS createdAt,
          read_at AS readAt
        FROM notifications
        WHERE user_id = @userId
        ORDER BY created_at DESC
      `);
    
    res.json({
      success: true,
      notifications: result.recordset,
      unreadCount: result.recordset.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications' 
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count (lightweight for navbar badge)
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = @userId AND is_read = 0
      `);
    
    res.json({
      success: true,
      count: result.recordset[0].count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch unread count' 
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    await pool.request()
      .input('notificationId', sql.BigInt, id)
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        UPDATE notifications
        SET is_read = 1, read_at = GETDATE()
        WHERE notification_id = @notificationId 
          AND user_id = @userId
          AND is_read = 0
      `);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as read' 
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    await pool.request()
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        UPDATE notifications
        SET is_read = 1, read_at = GETDATE()
        WHERE user_id = @userId AND is_read = 0
      `);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark all notifications as read' 
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    await pool.request()
      .input('notificationId', sql.BigInt, id)
      .input('userId', sql.BigInt, req.user.userId)
      .query(`
        DELETE FROM notifications
        WHERE notification_id = @notificationId 
          AND user_id = @userId
      `);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete notification' 
    });
  }
});

export default router;
