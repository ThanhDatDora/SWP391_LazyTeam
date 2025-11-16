/**
 * WebSocket Context for Real-time Features
 * Provides WebSocket connection and real-time functionality throughout the app
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';

// WebSocket connection state
const initialState = {
  socket: null,
  isConnected: false,
  connectionError: null,
  notifications: [],
  activeUsers: {},
  courseStats: {},
  messages: {},
  typingUsers: {},
  studySessions: {},
  isReconnecting: false,
  chatMessages: {}, // { conversationId: [messages] }
  conversationTyping: {}, // { conversationId: { userId: boolean } }
  isAccountLocked: false // Track if account is locked
};

// Action types
const WS_ACTIONS = {
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  UPDATE_ACTIVE_USERS: 'UPDATE_ACTIVE_USERS',
  UPDATE_COURSE_STATS: 'UPDATE_COURSE_STATS',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  UPDATE_STUDY_SESSION: 'UPDATE_STUDY_SESSION',
  SET_RECONNECTING: 'SET_RECONNECTING',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  SET_CONVERSATION_TYPING: 'SET_CONVERSATION_TYPING',
  SET_ACCOUNT_LOCKED: 'SET_ACCOUNT_LOCKED'
};

// Reducer function
function websocketReducer(state, action) {
  switch (action.type) {
    case WS_ACTIONS.SET_SOCKET:
      return { ...state, socket: action.payload };
    
    case WS_ACTIONS.SET_CONNECTED:
      return { 
        ...state, 
        isConnected: true, 
        connectionError: null,
        isReconnecting: false
      };
    
    case WS_ACTIONS.SET_DISCONNECTED:
      return { 
        ...state, 
        isConnected: false,
        isReconnecting: false
      };
    
    case WS_ACTIONS.SET_ERROR:
      return { 
        ...state, 
        connectionError: action.payload,
        isReconnecting: false
      };
    
    case WS_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50) // Keep last 50 notifications
      };
    
    case WS_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case WS_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
    
    case WS_ACTIONS.UPDATE_ACTIVE_USERS:
      return {
        ...state,
        activeUsers: { ...state.activeUsers, ...action.payload }
      };
    
    case WS_ACTIONS.UPDATE_COURSE_STATS:
      return {
        ...state,
        courseStats: { ...state.courseStats, [action.payload.courseId]: action.payload }
      };
    
    case WS_ACTIONS.ADD_MESSAGE:
      const { courseId, message } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [courseId]: [...(state.messages[courseId] || []), message].slice(-100) // Keep last 100 messages per course
        }
      };
    
    case WS_ACTIONS.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [action.payload.courseId]: action.payload.users }
      };
    
    case WS_ACTIONS.UPDATE_STUDY_SESSION:
      return {
        ...state,
        studySessions: { ...state.studySessions, [action.payload.sessionId]: action.payload }
      };
    
    case WS_ACTIONS.SET_RECONNECTING:
      return {
        ...state,
        isReconnecting: action.payload
      };
    
    case WS_ACTIONS.ADD_CHAT_MESSAGE:
      const { conversationId, message: chatMessage } = action.payload;
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [conversationId]: [...(state.chatMessages[conversationId] || []), chatMessage]
        }
      };
    
    case WS_ACTIONS.SET_CONVERSATION_TYPING:
      return {
        ...state,
        conversationTyping: {
          ...state.conversationTyping,
          [action.payload.conversationId]: action.payload.typing
        }
      };
    
    case WS_ACTIONS.SET_ACCOUNT_LOCKED:
      return {
        ...state,
        isAccountLocked: action.payload
      };
    
    default:
      return state;
  }
}

// Create context
const WebSocketContext = createContext();

// WebSocket Provider component
export function WebSocketProvider({ children }) {
  const [state, dispatch] = useReducer(websocketReducer, initialState);
  const { state: authState } = useAuth();
  const { toast } = useToast();

  // Connection management
  const connect = useCallback(() => {
    // Get token from localStorage (AuthContext doesn't export it in state)
    const token = localStorage.getItem('token');
    
    if (!authState.isAuthenticated || !token) {
      console.log('[WebSocket] Cannot connect:', { 
        isAuthenticated: authState.isAuthenticated, 
        hasToken: !!token 
      });
      return;
    }

    // Disconnect existing connection
    if (state.socket) {
      console.log('[WebSocket] Disconnecting existing socket...');
      state.socket.disconnect();
    }

    // Get backend URL from VITE_API_BASE_URL (remove /api suffix)
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const serverUrl = apiUrl.replace('/api', '');
    console.log('[WebSocket] Connecting to:', serverUrl);
    console.log('[WebSocket] Auth token length:', token.length);
    console.log('[WebSocket] User authenticated:', authState.isAuthenticated);
    
    const socket = io(serverUrl, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    // Set socket in state
    dispatch({ type: WS_ACTIONS.SET_SOCKET, payload: socket });
    
    // Expose socket instance to window for components that need direct access
    window.socketInstance = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[WebSocket] Connected to server');
      dispatch({ type: WS_ACTIONS.SET_CONNECTED });
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected from server:', reason);
      dispatch({ type: WS_ACTIONS.SET_DISCONNECTED });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      dispatch({ type: WS_ACTIONS.SET_ERROR, payload: error.message });
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[WebSocket] Reconnection attempt ${attemptNumber}`);
      dispatch({ type: WS_ACTIONS.SET_RECONNECTING, payload: true });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[WebSocket] Reconnected after ${attemptNumber} attempts`);
      toast({
        title: 'Reconnected',
        description: 'Real-time connection restored',
        variant: 'success'
      });
    });

    // Real-time event handlers
    socket.on('connected', (data) => {
      console.log('[WebSocket] Welcome message:', data);
    });

    socket.on('notification', (notification) => {
      const notificationWithId = {
        id: Date.now() + Math.random(),
        ...notification
      };
      dispatch({ type: WS_ACTIONS.ADD_NOTIFICATION, payload: notificationWithId });
      
      toast({
        title: notification.title || 'Notification',
        description: notification.message,
        variant: notification.type || 'info'
      });
    });

    socket.on('course_notification', (notification) => {
      dispatch({ type: WS_ACTIONS.ADD_NOTIFICATION, payload: {
        id: Date.now() + Math.random(),
        ...notification,
        type: 'course'
      }});
    });

    socket.on('admin_notification', (notification) => {
      dispatch({ type: WS_ACTIONS.ADD_NOTIFICATION, payload: {
        id: Date.now() + Math.random(),
        ...notification,
        type: 'admin'
      }});
      
      toast({
        title: 'Admin Announcement',
        description: notification.message,
        variant: 'info'
      });
    });

    socket.on('new_message', (message) => {
      dispatch({ 
        type: WS_ACTIONS.ADD_MESSAGE, 
        payload: { courseId: message.courseId, message }
      });
    });

    // Chat conversation events
    socket.on('new_chat_message', (message) => {
      dispatch({
        type: WS_ACTIONS.ADD_CHAT_MESSAGE,
        payload: { conversationId: message.conversation_id, message }
      });
    });

    socket.on('user_typing_in_conversation', (data) => {
      dispatch({
        type: WS_ACTIONS.SET_CONVERSATION_TYPING,
        payload: { 
          conversationId: data.conversationId, 
          typing: { [data.userId]: data.typing }
        }
      });
    });

    socket.on('new_message_notification', (data) => {
      toast({
        title: '💬 New Message',
        description: 'You have a new message',
        variant: 'info'
      });
    });

    socket.on('user_typing', (data) => {
      const { courseId, userId, typing } = data;
      dispatch({
        type: WS_ACTIONS.SET_TYPING_USERS,
        payload: {
          courseId,
          users: typing 
            ? [...(state.typingUsers[courseId] || []), userId]
            : (state.typingUsers[courseId] || []).filter(id => id !== userId)
        }
      });
    });

    socket.on('course_stats', (stats) => {
      dispatch({ type: WS_ACTIONS.UPDATE_COURSE_STATS, payload: stats });
    });

    socket.on('user_joined_course', (data) => {
      toast({
        title: 'User Joined',
        description: `${data.userEmail} joined the course`,
        variant: 'info'
      });
    });

    socket.on('user_left_course', (data) => {
      // Silent notification for user leaving
    });

    socket.on('progress_updated', (data) => {
      if (data.completed) {
        toast({
          title: 'Progress Update',
          description: `${data.userEmail || 'A student'} completed a lesson!`,
          variant: 'success'
        });
      }
    });

    socket.on('lesson_completed', (data) => {
      toast({
        title: '🎉 Congratulations!',
        description: data.message,
        variant: 'success'
      });
    });

    socket.on('error', (error) => {
      console.error('[WebSocket] Server error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    });

    // Account locked event - Real-time notification from admin
    socket.on('account-locked', (data) => {
      console.log('🔒 [WebSocket] Account locked event received:', data);
      dispatch({ type: WS_ACTIONS.SET_ACCOUNT_LOCKED, payload: true });
      
      toast({
        title: '⚠️ Tài khoản bị khóa',
        description: 'Tài khoản của bạn đã bị khóa bởi quản trị viên',
        variant: 'destructive'
      });
    });

    return socket;
  }, [authState.isAuthenticated, toast, dispatch]);

  const disconnect = useCallback(() => {
    if (state.socket) {
      state.socket.disconnect();
      dispatch({ type: WS_ACTIONS.SET_SOCKET, payload: null });
      dispatch({ type: WS_ACTIONS.SET_DISCONNECTED });
      
      // Clean up window reference
      if (window.socketInstance) {
        delete window.socketInstance;
      }
    }
  }, [state.socket]);

  // Auto connect/disconnect based on auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[WebSocket] useEffect triggered:', {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!token,
      tokenLength: token?.length
    });
    
    if (authState.isAuthenticated && token) {
      console.log('[WebSocket] Calling connect()...');
      connect();
    } else {
      console.log('[WebSocket] Not authenticated or no token, disconnecting...');
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated]);

  // Course methods
  const joinCourse = useCallback((courseId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('join_course', { courseId });
    }
  }, [state.socket, state.isConnected]);

  const leaveCourse = useCallback((courseId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('leave_course', { courseId });
    }
  }, [state.socket, state.isConnected]);

  const updateProgress = useCallback((courseId, lessonId, progress, completed = false) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('progress_update', {
        courseId,
        lessonId,
        progress,
        completed
      });
    }
  }, [state.socket, state.isConnected]);

  // Chat methods
  const sendMessage = useCallback((courseId, message, messageType = 'text') => {
    if (state.socket && state.isConnected) {
      state.socket.emit('chat_message', {
        courseId,
        message,
        messageType
      });
    }
  }, [state.socket, state.isConnected]);

  const startTyping = useCallback((courseId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('typing_start', { courseId });
    }
  }, [state.socket, state.isConnected]);

  const stopTyping = useCallback((courseId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('typing_stop', { courseId });
    }
  }, [state.socket, state.isConnected]);

  // Conversation chat methods
  const joinConversation = useCallback((conversationId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('join_conversation', { conversationId });
      console.log('📞 Joined conversation:', conversationId);
    }
  }, [state.socket, state.isConnected]);

  const leaveConversation = useCallback((conversationId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('leave_conversation', { conversationId });
      console.log('📞 Left conversation:', conversationId);
    }
  }, [state.socket, state.isConnected]);

  const sendChatMessage = useCallback((conversationId, message) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('send_chat_message', { conversationId, message });
    }
  }, [state.socket, state.isConnected]);

  const typingInConversation = useCallback((conversationId, typing) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('typing_in_conversation', { conversationId, typing });
    }
  }, [state.socket, state.isConnected]);

  // Study session methods
  const joinStudySession = useCallback((sessionId, courseId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('join_study_session', { sessionId, courseId });
    }
  }, [state.socket, state.isConnected]);

  const sendStudySessionAction = useCallback((sessionId, action, payload) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('study_session_action', { sessionId, action, payload });
    }
  }, [state.socket, state.isConnected]);

  // Notification methods
  const clearNotification = useCallback((notificationId) => {
    dispatch({ type: WS_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: WS_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);
  
  // Account locked method
  const resetAccountLocked = useCallback(() => {
    dispatch({ type: WS_ACTIONS.SET_ACCOUNT_LOCKED, payload: false });
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Connection methods
    connect,
    disconnect,
    
    // Course methods
    joinCourse,
    leaveCourse,
    updateProgress,
    
    // Chat methods
    sendMessage,
    startTyping,
    stopTyping,
    
    // Conversation chat methods
    joinConversation,
    leaveConversation,
    sendChatMessage,
    typingInConversation,
    
    // Study session methods
    joinStudySession,
    sendStudySessionAction,
    
    // Notification methods
    clearNotification,
    clearAllNotifications,
    
    // Account locked method
    resetAccountLocked,
    
    // Utility methods
    getCourseMessages: (courseId) => state.messages[courseId] || [],
    getCourseStats: (courseId) => state.courseStats[courseId] || { activeUsers: 0 },
    getTypingUsers: (courseId) => state.typingUsers[courseId] || [],
    
    // Expose socket for direct access when needed
    getSocket: () => state.socket
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Export context for advanced usage
export { WebSocketContext };