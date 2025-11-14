import React, { useState, useEffect, useRef } from 'react';
import { Send, Minimize2, Maximize2, X, MessageCircle, Loader2 } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * InstructorAdminChat Component
 * 
 * Floating chat widget cho giảng viên liên hệ với admin support.
 * 
 * Tính năng:
 * - Tự động tạo conversation khi mở lần đầu
 * - Realtime messaging qua WebSocket
 * - Typing indicators (hiển thị khi đang gõ)
 * - Unread count badge (số tin nhắn chưa đọc)
 * - Minimize/Maximize (thu nhỏ/phóng to)
 * - Chỉ hiển thị với instructors (role_id === 2)
 * - UI match với design system của project
 * - Dark mode support
 * 
 * Props:
 * @param {string} className - Additional CSS classes
 */
export function InstructorAdminChat({ className = '' }) {
  const { state: authState } = useAuth();
  const { joinConversation, leaveConversation, sendChatMessage, typingInConversation, isConnected } = useWebSocket();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const token = localStorage.getItem('token');
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load or create conversation
  const initializeConversation = async () => {
    try {
      setLoading(true);
      
      // Get conversations
      const convRes = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const convData = await convRes.json();
      
      let conv = null;
      
      if (convData.success && convData.data && convData.data.length > 0) {
        conv = convData.data[0];
        console.log('✅ Found existing conversation:', conv.conversation_id);
      } else if (authState.user.role_id === 2) {
        // Instructor creates new conversation
        const createRes = await fetch(`${API_BASE_URL}/chat/conversations`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const createData = await createRes.json();
        
        if (createData.success) {
          conv = { 
            conversation_id: createData.data.conversation_id,
            status: 'active'
          };
          console.log('✅ Created new conversation:', conv.conversation_id);
        }
      }
      
      if (conv) {
        setConversation(conv);
        joinConversation(conv.conversation_id);
        loadMessages(conv.conversation_id);
      }
    } catch (error) {
      console.error('❌ Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load messages
  const loadMessages = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data);
        setUnreadCount(0);
        console.log('✅ Loaded', data.data.length, 'messages');
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };
  
  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversation.conversation_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message_text: newMessage })
        }
      );
      
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Send via WebSocket for realtime
        sendChatMessage(conversation.conversation_id, data.data);
        
        // Stop typing indicator
        typingInConversation(conversation.conversation_id, false);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };
  
  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!conversation) return;
    
    // Start typing indicator
    if (!isTyping) {
      setIsTyping(true);
      typingInConversation(conversation.conversation_id, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      typingInConversation(conversation.conversation_id, false);
    }, 2000);
  };
  
  // Toggle chat
  const toggleChat = () => {
    if (!isOpen) {
      initializeConversation();
    } else {
      if (conversation) {
        leaveConversation(conversation.conversation_id);
      }
    }
    setIsOpen(!isOpen);
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Only show for instructors (role_id === 2)
  // Kiểm tra role để đảm bảo chỉ instructor mới thấy chat button
  if (!authState?.user || authState.user.role_id !== 2) {
    return null;
  }
  
  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all ${className}`}
          title="Chat with Admin Support"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl ${isMinimized ? 'h-14' : 'h-[500px]'} flex flex-col border border-gray-200 dark:border-gray-700`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat with Admin
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="hover:bg-indigo-700 p-1 rounded transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={toggleChat} 
                className="hover:bg-indigo-700 p-1 rounded transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-2">Start a conversation with admin support!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${msg.sender_id === authState.user.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-lg p-3 ${
                        msg.sender_id === authState.user.user_id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {msg.sender_id !== authState.user.user_id && (
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {msg.sender_role === 'admin' ? '👨‍💼 Admin' : msg.sender_name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={!isConnected || !conversation}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected || !conversation}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2">Disconnected. Reconnecting...</p>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
