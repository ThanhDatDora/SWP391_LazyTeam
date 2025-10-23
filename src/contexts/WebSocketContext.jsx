/**
 * WebSocket Context for Real-time Features
 * Provides WebSocket connection and real-time functionality throughout the app
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/toast';

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
  isReconnecting: false
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
  SET_RECONNECTING: 'SET_RECONNECTING'
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
    if (!authState.isAuthenticated || !authState.token) {return;}

    // Disconnect existing connection
    if (state.socket) {
      state.socket.disconnect();
    }

    const serverUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    const socket = io(serverUrl, {
      auth: {
        token: authState.token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    // Set socket in state
    dispatch({ type: WS_ACTIONS.SET_SOCKET, payload: socket });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[WebSocket] Connected to server');
      dispatch({ type: WS_ACTIONS.SET_CONNECTED });
      
      toast({
        title: 'Connected',
        description: 'Real-time features are now active',
        variant: 'success'
      });
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
      
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to real-time service',
        variant: 'destructive'
      });
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

    return socket;
  }, [authState.isAuthenticated, authState.token, toast]);

  const disconnect = useCallback(() => {
    if (state.socket) {
      state.socket.disconnect();
      dispatch({ type: WS_ACTIONS.SET_SOCKET, payload: null });
      dispatch({ type: WS_ACTIONS.SET_DISCONNECTED });
    }
  }, [state.socket]);

  // Auto connect/disconnect based on auth state
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [authState.isAuthenticated, authState.token, connect, disconnect]);

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
    
    // Study session methods
    joinStudySession,
    sendStudySessionAction,
    
    // Notification methods
    clearNotification,
    clearAllNotifications,
    
    // Utility methods
    getCourseMessages: (courseId) => state.messages[courseId] || [],
    getCourseStats: (courseId) => state.courseStats[courseId] || { activeUsers: 0 },
    getTypingUsers: (courseId) => state.typingUsers[courseId] || []
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