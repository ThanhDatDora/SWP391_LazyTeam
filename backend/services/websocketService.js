/**
 * WebSocket Service for Real-time Features
 * Handles live notifications, chat, course progress updates
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userRooms = new Map(); // userId -> Set of room names
    this.courseRooms = new Map(); // courseId -> Set of userIds
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        console.log('[WebSocket] 🔐 New connection attempt...');
        console.log('[WebSocket] 🔐 Handshake auth:', socket.handshake.auth);
        
        const token = socket.handshake.auth.token;
        if (!token) {
          console.error('[WebSocket] ❌ No token provided');
          return next(new Error('Authentication error: No token provided'));
        }

        console.log('[WebSocket] 🔑 Token received, length:', token.length);
        console.log('[WebSocket] 🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('[WebSocket] ✅ Token decoded:', decoded);
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;
        
        console.log(`[WebSocket] ✅ User ${decoded.userId} (${decoded.email}) authenticated`);
        next();
      } catch (err) {
        console.error('[WebSocket] ❌ Authentication error:', err.message);
        console.error('[WebSocket] ❌ Error stack:', err.stack);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userRooms.set(socket.userId, new Set());

      // Join user's personal room for direct notifications
      socket.join(`user:${socket.userId}`);
      
      // Handle course enrollment (join course room)
      socket.on('join_course', (data) => {
        this.handleJoinCourse(socket, data);
      });

      // Handle leaving course room  
      socket.on('leave_course', (data) => {
        this.handleLeaveCourse(socket, data);
      });

      // Handle course progress updates
      socket.on('progress_update', (data) => {
        this.handleProgressUpdate(socket, data);
      });

      // Handle chat messages
      socket.on('chat_message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle live study sessions
      socket.on('join_study_session', (data) => {
        this.handleJoinStudySession(socket, data);
      });

      socket.on('study_session_action', (data) => {
        this.handleStudySessionAction(socket, data);
      });

      // Handle admin broadcasts
      socket.on('admin_broadcast', (data) => {
        this.handleAdminBroadcast(socket, data);
      });

      // Handle chat conversations (Instructor-Admin Chat)
      socket.on('join_conversation', (data) => {
        console.log(`[WebSocket] 🎯 RECEIVED join_conversation event from user ${socket.userId}:`, data);
        this.handleJoinConversation(socket, data);
      });

      socket.on('leave_conversation', (data) => {
        console.log(`[WebSocket] 🎯 RECEIVED leave_conversation event from user ${socket.userId}:`, data);
        this.handleLeaveConversation(socket, data);
      });

      socket.on('send_chat_message', (data) => {
        this.handleSendChatMessage(socket, data);
      });

      socket.on('typing_in_conversation', (data) => {
        this.handleTypingInConversation(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Mini Coursera real-time service',
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });
  }

  handleJoinCourse(socket, data) {
    try {
      const { courseId } = data;
      if (!courseId) {return;}

      const roomName = `course:${courseId}`;
      socket.join(roomName);
      
      // Track course membership
      if (!this.courseRooms.has(courseId)) {
        this.courseRooms.set(courseId, new Set());
      }
      this.courseRooms.get(courseId).add(socket.userId);
      this.userRooms.get(socket.userId).add(roomName);

      console.log(`[WebSocket] User ${socket.userId} joined course ${courseId}`);
      
      // Notify others in the course
      socket.to(roomName).emit('user_joined_course', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        courseId,
        timestamp: new Date().toISOString()
      });

      // Send current course stats
      socket.emit('course_stats', {
        courseId,
        activeUsers: this.courseRooms.get(courseId).size,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[WebSocket] Error joining course:', error);
      socket.emit('error', { message: 'Failed to join course', error: error.message });
    }
  }

  handleLeaveCourse(socket, data) {
    try {
      const { courseId } = data;
      if (!courseId) {return;}

      const roomName = `course:${courseId}`;
      socket.leave(roomName);
      
      // Update tracking
      if (this.courseRooms.has(courseId)) {
        this.courseRooms.get(courseId).delete(socket.userId);
      }
      this.userRooms.get(socket.userId).delete(roomName);

      console.log(`[WebSocket] User ${socket.userId} left course ${courseId}`);
      
      // Notify others
      socket.to(roomName).emit('user_left_course', {
        userId: socket.userId,
        courseId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[WebSocket] Error leaving course:', error);
    }
  }

  handleProgressUpdate(socket, data) {
    try {
      const { courseId, lessonId, progress, completed } = data;
      
      // Broadcast to course room
      const roomName = `course:${courseId}`;
      socket.to(roomName).emit('progress_updated', {
        userId: socket.userId,
        courseId,
        lessonId,
        progress,
        completed,
        timestamp: new Date().toISOString()
      });

      // Send congratulations for completion
      if (completed) {
        socket.emit('lesson_completed', {
          message: 'Congratulations! Lesson completed!',
          lessonId,
          courseId,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[WebSocket] Progress update - User ${socket.userId}, Course ${courseId}, Progress: ${progress}%`);

    } catch (error) {
      console.error('[WebSocket] Error updating progress:', error);
      socket.emit('error', { message: 'Failed to update progress', error: error.message });
    }
  }

  handleChatMessage(socket, data) {
    try {
      const { courseId, message, messageType = 'text' } = data;
      
      const chatMessage = {
        id: Date.now(),
        userId: socket.userId,
        userEmail: socket.userEmail,
        courseId,
        message,
        messageType,
        timestamp: new Date().toISOString()
      };

      // Broadcast to course room
      const roomName = `course:${courseId}`;
      this.io.to(roomName).emit('new_message', chatMessage);

      console.log(`[WebSocket] Chat message in course ${courseId} from ${socket.userEmail}: ${message}`);

    } catch (error) {
      console.error('[WebSocket] Error sending chat message:', error);
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  }

  handleTypingStart(socket, data) {
    try {
      const { courseId } = data;
      const roomName = `course:${courseId}`;
      
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        courseId,
        typing: true
      });

    } catch (error) {
      console.error('[WebSocket] Error handling typing start:', error);
    }
  }

  handleTypingStop(socket, data) {
    try {
      const { courseId } = data;
      const roomName = `course:${courseId}`;
      
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        courseId,
        typing: false
      });

    } catch (error) {
      console.error('[WebSocket] Error handling typing stop:', error);
    }
  }

  handleJoinStudySession(socket, data) {
    try {
      const { sessionId, courseId } = data;
      const roomName = `study:${sessionId}`;
      
      socket.join(roomName);
      
      socket.to(roomName).emit('user_joined_session', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        sessionId,
        courseId,
        timestamp: new Date().toISOString()
      });

      console.log(`[WebSocket] User ${socket.userId} joined study session ${sessionId}`);

    } catch (error) {
      console.error('[WebSocket] Error joining study session:', error);
    }
  }

  handleStudySessionAction(socket, data) {
    try {
      const { sessionId, action, payload } = data;
      const roomName = `study:${sessionId}`;
      
      socket.to(roomName).emit('session_action', {
        userId: socket.userId,
        action,
        payload,
        timestamp: new Date().toISOString()
      });

      console.log(`[WebSocket] Study session action: ${action} in session ${sessionId}`);

    } catch (error) {
      console.error('[WebSocket] Error handling study session action:', error);
    }
  }

  handleAdminBroadcast(socket, data) {
    try {
      // Only allow admin users
      if (socket.userRole !== 'admin') {
        socket.emit('error', { message: 'Unauthorized: Admin access required' });
        return;
      }

      const { message, targetType = 'all', targetId } = data;
      const broadcast = {
        type: 'admin_broadcast',
        message,
        from: socket.userEmail,
        timestamp: new Date().toISOString()
      };

      if (targetType === 'all') {
        this.io.emit('admin_notification', broadcast);
      } else if (targetType === 'course' && targetId) {
        this.io.to(`course:${targetId}`).emit('admin_notification', broadcast);
      } else if (targetType === 'user' && targetId) {
        this.io.to(`user:${targetId}`).emit('admin_notification', broadcast);
      }

      console.log(`[WebSocket] Admin broadcast from ${socket.userEmail}: ${message}`);

    } catch (error) {
      console.error('[WebSocket] Error sending admin broadcast:', error);
      socket.emit('error', { message: 'Failed to send broadcast', error: error.message });
    }
  }

  handleDisconnect(socket) {
    console.log(`[WebSocket] User ${socket.userId} disconnected`);
    
    // Clean up connections
    this.connectedUsers.delete(socket.userId);
    
    // Clean up course rooms
    if (this.userRooms.has(socket.userId)) {
      const userRooms = this.userRooms.get(socket.userId);
      userRooms.forEach(roomName => {
        if (roomName.startsWith('course:')) {
          const courseId = roomName.split(':')[1];
          if (this.courseRooms.has(courseId)) {
            this.courseRooms.get(courseId).delete(socket.userId);
          }
        }
      });
      this.userRooms.delete(socket.userId);
    }

    // Notify all rooms about user disconnection
    socket.broadcast.emit('user_disconnected', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  }

  // Public methods for external use
  
  sendNotificationToUser(userId, notification) {
    try {
      const socketId = this.connectedUsers.get(userId);
      if (socketId) {
        this.io.to(`user:${userId}`).emit('notification', {
          ...notification,
          timestamp: new Date().toISOString()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('[WebSocket] Error sending notification to user:', error);
      return false;
    }
  }

  sendNotificationToCourse(courseId, notification) {
    try {
      this.io.to(`course:${courseId}`).emit('course_notification', {
        ...notification,
        courseId,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending notification to course:', error);
      return false;
    }
  }

  broadcastToAll(message) {
    try {
      this.io.emit('global_broadcast', {
        message,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('[WebSocket] Error broadcasting to all:', error);
      return false;
    }
  }

  getConnectedUsers() {
    return {
      count: this.connectedUsers.size,
      users: Array.from(this.connectedUsers.keys())
    };
  }

  getCourseStats(courseId) {
    return {
      courseId,
      activeUsers: this.courseRooms.get(courseId)?.size || 0,
      connectedUsers: Array.from(this.courseRooms.get(courseId) || [])
    };
  }

  /**
   * Emit account-locked event to specific user (real-time notification)
   * @param {number} userId - User ID to notify
   * @param {string} fullName - User's full name
   */
  emitAccountLocked(userId, fullName) {
    try {
      const socketId = this.connectedUsers.get(userId.toString());
      
      if (socketId) {
        console.log(`🔒 [WebSocket] Emitting account-locked to user ${userId} (${fullName})`);
        console.log(`🔒 [WebSocket] Socket ID: ${socketId}`);
        
        // Emit to both socket ID and user room
        this.io.to(socketId).emit('account-locked', {
          userId,
          fullName,
          timestamp: new Date().toISOString()
        });
        
        // Also emit to user's personal room (format: user:userId)
        this.io.to(`user:${userId}`).emit('account-locked', {
          userId,
          fullName,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ [WebSocket] account-locked event sent to user ${userId}`);
        return true;
      } else {
        console.log(`⚠️ [WebSocket] User ${userId} not connected, cannot emit account-locked`);
        return false;
      }
    } catch (error) {
      console.error('[WebSocket] Error emitting account-locked:', error);
      return false;
    }
  }

  // ===== CHAT CONVERSATION HANDLERS =====

  handleJoinConversation(socket, data) {
    try {
      const { conversationId } = data;
      console.log(`[WebSocket] 🔍 Join request from user ${socket.userId}:`, {
        conversationId,
        type: typeof conversationId,
        data
      });
      
      if (!conversationId) {
        console.warn(`[WebSocket] ⚠️ User ${socket.userId} tried to join conversation without conversationId`);
        return;
      }

      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);

      console.log(`[WebSocket] ✅ User ${socket.userId} joined conversation ${conversationId} (room: ${roomName})`);
      
      // Log all clients in room
      const clientsInRoom = this.io.sockets.adapter.rooms.get(roomName);
      console.log(`[WebSocket] 👥 Clients in room ${roomName}:`, clientsInRoom?.size || 0);
      if (clientsInRoom) {
        console.log(`[WebSocket] 👥 Socket IDs:`, Array.from(clientsInRoom));
      }

      // Notify others in conversation
      socket.to(roomName).emit('user_joined_conversation', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        conversationId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[WebSocket] Error joining conversation:', error);
    }
  }

  handleLeaveConversation(socket, data) {
    try {
      const { conversationId } = data;
      if (!conversationId) return;

      const roomName = `conversation:${conversationId}`;
      socket.leave(roomName);

      console.log(`[WebSocket] User ${socket.userId} left conversation ${conversationId}`);

      // Notify others
      socket.to(roomName).emit('user_left_conversation', {
        userId: socket.userId,
        conversationId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[WebSocket] Error leaving conversation:', error);
    }
  }

  handleSendChatMessage(socket, data) {
    try {
      const { conversationId, message } = data;
      const roomName = `conversation:${conversationId}`;

      const chatMessage = {
        ...message,
        userId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date().toISOString()
      };

      // Broadcast to conversation room (excluding sender)
      socket.to(roomName).emit('new_chat_message', chatMessage);

      // Send confirmation to sender
      socket.emit('message_sent', chatMessage);

      console.log(`[WebSocket] Chat message in conversation ${conversationId} from ${socket.userEmail}`);
    } catch (error) {
      console.error('[WebSocket] Error sending chat message:', error);
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  }

  handleTypingInConversation(socket, data) {
    try {
      const { conversationId, typing } = data;
      const roomName = `conversation:${conversationId}`;

      socket.to(roomName).emit('user_typing_in_conversation', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        conversationId,
        typing,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[WebSocket] Error handling typing:', error);
    }
  }

  /**
   * Emit new chat message notification
   * @param {number} conversationId - Conversation ID
   * @param {object} message - Message data
   */
  emitNewChatMessage(conversationId, message) {
    try {
      const roomName = `conversation:${conversationId}`;
      
      this.io.to(roomName).emit('new_chat_message', {
        ...message,
        timestamp: new Date().toISOString()
      });

      console.log(`[WebSocket] New chat message emitted to conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('[WebSocket] Error emitting chat message:', error);
      return false;
    }
  }

  /**
   * Emit new learner chat message notification (for learner-instructor conversations)
   * @param {number} conversationId - Conversation ID
   * @param {object} message - Message data
   */
  emitNewLearnerChatMessage(conversationId, message) {
    try {
      const roomName = `conversation:${conversationId}`;
      
      console.log(`[WebSocket] 🔔 Emitting new_learner_chat_message:`, {
        conversationId,
        conversationIdType: typeof conversationId,
        roomName,
        messageId: message?.message_id,
        clientsInRoom: this.io.sockets.adapter.rooms.get(roomName)?.size || 0
      });
      
      this.io.to(roomName).emit('new_learner_chat_message', {
        conversation_id: conversationId,
        message: message
      });

      console.log(`[WebSocket] ✅ New learner chat message emitted to conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('[WebSocket] Error emitting learner chat message:', error);
      return false;
    }
  }

  /**
   * Send notification to user about new message
   * @param {number} userId - User ID to notify
   * @param {number} conversationId - Conversation ID
   * @param {object} message - Message preview
   */
  sendNewMessageNotification(userId, conversationId, message) {
    try {
      this.io.to(`user:${userId}`).emit('new_message_notification', {
        conversationId,
        message,
        timestamp: new Date().toISOString()
      });

      console.log(`[WebSocket] New message notification sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending notification:', error);
      return false;
    }
  }
}

export default WebSocketService;