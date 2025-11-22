/**
 * ChatBox Component - Real-time Chat Interface
 * Supports:
 * - Admin ↔ Instructor conversations
 * - Learner ↔ Instructor conversations (per course)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Minimize2, Maximize2, Archive, Trash2, MoreVertical, Users, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * ChatBox Component
 * @param {Object} props
 * @param {number} props.conversationId - ID of conversation (optional for instructor creating new)
 * @param {number} props.courseId - For learner-instructor chat (required for learner)
 * @param {string} props.chatType - 'admin-instructor' or 'learner-instructor'
 * @param {boolean} props.isOpen - Control visibility
 * @param {function} props.onClose - Close handler
 * @param {function} props.onMinimize - Minimize handler
 * @param {boolean} props.fullScreen - If true, renders as full container (not fixed position)
 */
export default function ChatBox({ 
  conversationId: initialConversationId,
  courseId,
  chatType = 'admin-instructor',
  isOpen = true,
  onClose,
  onMinimize,
  fullScreen = false,
  onMarkAsRead
}) {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const { isConnected, chatMessages } = useWebSocket(); // Removed joinConversation, leaveConversation (handled by parent)
  
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const shouldScrollRef = useRef(false); // Flag to force scroll when user sends message

  // Get socket from global instance
  useEffect(() => {
    if (window.socketInstance) {
      socketRef.current = window.socketInstance;
    }
  }, []);

  // Check if user is near bottom of scroll (within 100px)
  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Auto-scroll to bottom when new messages arrive (scroll container only, not page)
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Fetch or create conversation
  useEffect(() => {
    if (!isOpen) return;
    
    const initConversation = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // If no conversationId, create one (for instructor)
        if (!conversationId && chatType === 'admin-instructor') {
          const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          if (data.success) {
            setConversationId(data.data.conversation_id);
          }
        }
        
        // For learner-instructor chat, create or get conversation by courseId
        if (!conversationId && chatType === 'learner-instructor' && courseId) {
          const response = await fetch(`${API_BASE_URL}/chat/learner/conversations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_id: courseId })
          });
          
          const data = await response.json();
          if (data.success) {
            setConversationId(data.data.conversation_id);
          }
        }
      } catch (error) {
        console.error('❌ Error initializing conversation:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo cuộc trò chuyện',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initConversation();
  }, [isOpen, conversationId, chatType, courseId, toast]);

  // Fetch initial messages ONLY when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = chatType === 'learner-instructor'
          ? `/chat/learner/conversations/${conversationId}/messages`
          : `/chat/conversations/${conversationId}/messages`;
        
        const response = await fetch(`${API_BASE_URL}${endpoint}?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('📥 ChatBox: Initial fetch loaded', data.data.length, 'messages');
          setMessages(data.data);
          setTimeout(() => scrollToBottom(), 100);
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [conversationId, chatType]); // Remove isOpen, scrollToBottom to prevent refetch

  // Mark as read helper function (defined before use in sync effect)
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        console.log('✅ ChatBox: Marked conversation', conversationId, 'as read');
        // Notify parent to reload conversation list
        if (onMarkAsRead) {
          onMarkAsRead();
        }
      }
    } catch (error) {
      console.error('❌ ChatBox: Error marking as read:', error);
    }
  }, [conversationId]);

  // Sync WebSocket messages to local state for real-time updates (matching ConversationsPage pattern)
  useEffect(() => {
    console.log('🔍 ChatBox sync check:', {
      conversationId,
      conversationIdType: typeof conversationId,
      hasChatMessages: !!chatMessages,
      chatMessagesKeys: Object.keys(chatMessages || {}),
      wsMessagesForThisConv: chatMessages?.[conversationId],
      wsMessagesCount: chatMessages?.[conversationId]?.length || 0,
      currentMessagesCount: messages.length
    });
    
    if (conversationId && chatMessages[conversationId]) {
      const wsMessages = chatMessages[conversationId];
      console.log('✅ ChatBox found wsMessages:', wsMessages.length, 'messages for conversation', conversationId);
      
      // Check if user was near bottom before adding new messages
      const wasNearBottom = isNearBottom();
      
      // Only add new messages that aren't already in state
      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(m => m.message_id));
        const newMessages = wsMessages.filter(m => !existingIds.has(m.message_id));
        
        if (newMessages.length > 0) {
          console.log('📨 ChatBox: Adding', newMessages.length, 'new WebSocket messages:', newMessages.map(m => m.message_id));
          console.log('📨 Full new messages:', newMessages);
          
          // Check if any new message is from current user
          const currentUserId = authState.user?.user_id || authState.user?.userId;
          const hasOwnMessage = newMessages.some(msg => msg.sender_id === parseInt(currentUserId));
          
          console.log('🔍 Scroll decision:', {
            wasNearBottom,
            hasOwnMessage,
            shouldScrollRef: shouldScrollRef.current,
            currentUserId,
            newMessageSenderIds: newMessages.map(m => m.sender_id),
            willScroll: wasNearBottom || hasOwnMessage || shouldScrollRef.current
          });
          
          // Only auto-scroll if:
          // 1. User was already at bottom (viewing latest messages), OR
          // 2. New message is from current user (sender should see their own message), OR
          // 3. shouldScrollRef flag is set (user just sent a message)
          if (wasNearBottom || hasOwnMessage || shouldScrollRef.current) {
            setTimeout(() => scrollToBottom(), 100);
            shouldScrollRef.current = false; // Reset flag after scrolling
          }
          
          // Mark as read if chat is visible (fullScreen always visible, or popup open and not minimized)
          const isChatVisible = fullScreen || (isOpen && !isMinimized);
          if (isChatVisible) {
            console.log('👁️ ChatBox visible - marking as read');
            markAsRead();
          } else {
            console.log('👁️ ChatBox not visible - incrementing unread count');
            setUnreadCount(prev => prev + newMessages.length);
          }
          
          return [...prevMessages, ...newMessages];
        }
        
        console.log('⏭️ ChatBox: No new messages to add (all exist already)');
        return prevMessages;
      });
    } else {
      console.log('⚠️ ChatBox: No wsMessages found for conversation', conversationId);
      console.log('⚠️ Available conversations in chatMessages:', Object.keys(chatMessages || {}));
    }
  }, [chatMessages, conversationId, isOpen, isMinimized, isNearBottom, scrollToBottom, markAsRead, authState.user]);
  
  // NOTE: Join/leave conversation is handled by parent component (LearnerChatPage/InstructorChatPage)
  // No need to join/leave here to avoid duplicate joins
  
  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized && conversationId) {
      markAsRead();
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized, conversationId, markAsRead]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    // Set flag to force scroll when message arrives via WebSocket
    shouldScrollRef.current = true;
    
    try {
      setIsSending(true);
      const token = localStorage.getItem('token');
      const endpoint = chatType === 'learner-instructor'
        ? `/chat/learner/conversations/${conversationId}/messages`
        : `/chat/conversations/${conversationId}/messages`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message_text: newMessage.trim(),
          message_type: 'text'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Don't add message here - let WebSocket event handle it to avoid duplicates
        // Both sender and receiver will get the message via WebSocket
        setNewMessage('');
        console.log('✅ Message sent:', data.data.message_id, '- waiting for WebSocket event');
      } else {
        // Reset flag if message failed to send
        shouldScrollRef.current = false;
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Reset flag on error
      shouldScrollRef.current = false;
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi tin nhắn',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  const getChatTitle = () => {
    if (chatType === 'admin-instructor') {
      return authState.user?.role === 'admin' 
        ? `Hỗ trợ Giảng viên`
        : 'Hỗ trợ Admin';
    } else {
      // learner-instructor chat: Check role_id to determine title
      // role_id === 2: Instructor → "Chat với Học viên"
      // role_id === 3: Learner → "Chat với Giảng viên"
      return authState.user?.role_id === 2 
        ? 'Chat với Học viên'
        : 'Chat với Giảng viên';
    }
  };

  if (!isOpen) return null;

  // Container styles - different for fullScreen vs floating
  const containerStyles = fullScreen 
    ? {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '0',
        overflow: 'hidden'
      }
    : {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: isMinimized ? '320px' : '420px',
        maxHeight: isMinimized ? '64px' : '680px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      };

  return (
    <div style={containerStyles}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white border-b border-blue-500">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h3 className="font-semibold text-sm">{getChatTitle()}</h3>
          {unreadCount > 0 && !isMinimized && (
            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {!fullScreen && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-blue-700 p-1 h-auto"
              onClick={() => {
                setIsMinimized(!isMinimized);
                onMinimize?.();
              }}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-blue-700 p-1 h-auto"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" 
            style={{ minHeight: '480px', maxHeight: '520px' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs mt-1">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const currentUserId = authState.user?.user_id || authState.user?.userId;
                const isOwn = msg.sender_id === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                
                return (
                  <div key={msg.message_id || index} 
                       className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isOwn && showAvatar && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold">
                        {msg.sender_name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-6" />}
                    
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {showAvatar && !isOwn && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
                          {msg.sender_name}
                        </p>
                      )}
                      
                      <div className={`rounded-lg px-3 py-2 shadow-sm ${
                        isOwn 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none' 
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-none'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message_text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                          {isOwn && (
                            msg.is_read ? 
                              <CheckCheck className="w-3 h-3 text-blue-100" /> :
                              <Check className="w-3 h-3 text-blue-100" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newMessage.trim() || isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </>
      )}
      
      {/* Minimized view */}
      {isMinimized && unreadCount > 0 && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </Badge>
        </div>
      )}
    </div>
  );
}
