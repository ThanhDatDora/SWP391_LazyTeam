import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, MessageCircle, Loader2, Archive, Trash2, MoreVertical, RotateCcw, Inbox, User, Clock } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper to format time correctly from SQL Server datetime
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

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
  const { joinConversation, leaveConversation, sendChatMessage, typingInConversation, isConnected, chatMessages } = useWebSocket();
  
  // Theme state matching AdminPanel pattern
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('instructorTheme') || localStorage.getItem('theme');
    return saved || 'light';
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, conversationId: null });
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const token = localStorage.getItem('token');
  
  // Theme colors matching AdminPanel
  const currentColors = {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    card: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    text: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    textSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
    hover: theme === 'dark' ? '#334155' : '#f1f5f9',
    primary: '#6366f1',
    primaryHover: '#4f46e5'
  };
  
  // Listen to theme changes
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme || localStorage.getItem('instructorTheme') || localStorage.getItem('theme') || 'light';
      setTheme(newTheme);
    };
    
    window.addEventListener('instructorThemeChanged', handleThemeChange);
    window.addEventListener('themeChanged', handleThemeChange);
    
    const currentTheme = localStorage.getItem('instructorTheme') || localStorage.getItem('theme') || 'light';
    if (currentTheme !== theme) {
      setTheme(currentTheme);
    }
    
    return () => {
      window.removeEventListener('instructorThemeChanged', handleThemeChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load conversations by status
  const loadConversations = async (status = 'active') => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations?status=${status}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setConversations(data.data);
        console.log(`✅ Loaded ${data.data.length} ${status} conversations`);
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  };
  
  // Load unread count - total unread messages (max 99+)
  const loadUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        // Sum up all unread_count from conversations
        const totalUnread = data.data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        // Cap at 99
        setUnreadCount(Math.min(totalUnread, 99));
        console.log('📬 Total unread messages:', totalUnread);
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  };
  
  // Load or create conversation
  const initializeConversation = async () => {
    try {
      setLoading(true);
      
      // Load conversations first
      await loadConversations(activeTab);
      
      // Get active conversations
      const convRes = await fetch(`${API_BASE_URL}/chat/conversations?status=active`, {
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
          await loadConversations(activeTab); // Reload list
        }
      }
      
      if (conv) {
        setConversation(conv);
        
        // Join WebSocket room
        if (isConnected) {
          joinConversation(conv.conversation_id);
        }
        
        // Load messages
        const msgRes = await fetch(
          `${API_BASE_URL}/chat/conversations/${conv.conversation_id}/messages`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const msgData = await msgRes.json();
        
        if (msgData.success) {
          setMessages(msgData.data || []);
          setUnreadCount(0);
          // Reload total unread count to update badge (messages were marked as read by server)
          await loadUnreadCount();
        }
      }
    } catch (error) {
      console.error('❌ Error initializing conversation:', error);
    } finally {
      setLoading(false);
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
        console.log('✅ Message sent:', data.data.message_id, '- waiting for WebSocket event');
        setNewMessage('');
        
        // Send via WebSocket for realtime
        sendChatMessage(conversation.conversation_id, data.data);
        
        // Stop typing indicator
        typingInConversation(conversation.conversation_id, false);
        
        // DON'T add to local state here - let WebSocket sync handle it
        // This prevents duplicate messages on sender's side
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
  
  // Archive conversation with modal confirmation
  const handleArchive = async () => {
    if (!conversation) return;
    
    setConfirmModal({
      open: true,
      action: 'archive',
      conversationId: conversation.conversation_id,
      title: 'Xác nhận lưu trữ',
      message: 'Bạn có chắc chắn muốn lưu trữ đoạn chat này không?'
    });
  };
  
  const confirmArchive = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/archive`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        console.log('✅ Conversation archived');
        setIsOpen(false);
        setConversation(null);
        setMessages([]);
        await loadConversations(activeTab);
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('❌ Error archiving conversation:', error);
    } finally {
      setConfirmModal({ open: false, action: null, conversationId: null });
    }
  };
  
  // Delete conversation with modal confirmation
  const handleDelete = async () => {
    if (!conversation) return;
    
    setConfirmModal({
      open: true,
      action: 'delete',
      conversationId: conversation.conversation_id,
      title: 'Xác nhận xóa vĩnh viễn',
      message: 'Đoạn chat này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn không?',
      isDangerous: true
    });
  };
  
  const confirmDelete = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        console.log('✅ Conversation deleted');
        setIsOpen(false);
        setConversation(null);
        setMessages([]);
        await loadConversations(activeTab);
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
    } finally {
      setConfirmModal({ open: false, action: null, conversationId: null });
    }
  };
  
  // Restore conversation
  const handleRestore = async (conversationId) => {
    setConfirmModal({
      open: true,
      action: 'restore',
      conversationId,
      title: 'Xác nhận khôi phục',
      message: 'Bạn có muốn khôi phục đoạn chat này không?'
    });
  };
  
  const confirmRestore = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/restore`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        console.log('✅ Conversation restored');
        
        // Switch to active tab
        setActiveTab('active');
        
        // Reload active conversations
        await loadConversations('active');
        await loadUnreadCount();
        
        // Load the restored conversation with messages
        const convRes = await fetch(`${API_BASE_URL}/chat/conversations?status=active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const convData = await convRes.json();
        
        if (convData.success && convData.data && convData.data.length > 0) {
          const restoredConv = convData.data.find(c => c.conversation_id === conversationId) || convData.data[0];
          setConversation(restoredConv);
          
          // Join WebSocket room
          if (isConnected) {
            joinConversation(restoredConv.conversation_id);
          }
          
          // Load messages
          const msgRes = await fetch(
            `${API_BASE_URL}/chat/conversations/${restoredConv.conversation_id}/messages`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          const msgData = await msgRes.json();
          
          if (msgData.success) {
            setMessages(msgData.data || []);
            setUnreadCount(0);
            console.log('✅ Loaded', (msgData.data || []).length, 'messages after restore');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error restoring conversation:', error);
    } finally {
      setConfirmModal({ open: false, action: null, conversationId: null });
    }
  };
  
  // Handle modal confirmation
  const handleConfirm = () => {
    const { action, conversationId } = confirmModal;
    if (action === 'archive') {
      confirmArchive(conversationId);
    } else if (action === 'delete') {
      confirmDelete(conversationId);
    } else if (action === 'restore') {
      confirmRestore(conversationId);
    }
  };
  
  // Toggle chat
  const toggleChat = async () => {
    if (!isOpen) {
      // Opening chat - clear badge and initialize
      setUnreadCount(0);
      initializeConversation();
      setIsOpen(true);
    } else {
      // Closing chat - mark messages as read before closing
      if (conversation) {
        try {
          // Mark all messages in this conversation as read
          await fetch(`${API_BASE_URL}/chat/conversations/${conversation.conversation_id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ Marked conversation as read before closing');
          
          // Reload unread count to update badge immediately
          await loadUnreadCount();
          console.log('✅ Reloaded unread count after marking as read');
        } catch (error) {
          console.error('❌ Error marking as read:', error);
        }
        
        leaveConversation(conversation.conversation_id);
      }
      setIsOpen(false);
    }
  };
  
  // Listen for conversation deleted/archived events
  useEffect(() => {
    if (!isConnected || !conversation) return;
    
    const socket = window.io ? window.io() : null;
    if (!socket) return;
    
    const handleConversationDeleted = (data) => {
      if (data.conversation_id === conversation.conversation_id) {
        console.log('🗑️ Conversation deleted by admin');
        setIsOpen(false);
        setConversation(null);
        setMessages([]);
        alert('Cuộc hội thoại đã bị xóa bởi admin');
      }
    };
    
    const handleConversationArchived = (data) => {
      if (data.conversation_id === conversation.conversation_id) {
        console.log('📦 Conversation archived by admin');
        setIsOpen(false);
        setConversation(null);
        setMessages([]);
        alert('Cuộc hội thoại đã được lưu trữ');
      }
    };
    
    socket.on('conversation_deleted', handleConversationDeleted);
    socket.on('conversation_archived', handleConversationArchived);
    
    return () => {
      socket.off('conversation_deleted', handleConversationDeleted);
      socket.off('conversation_archived', handleConversationArchived);
    };
  }, [isConnected, conversation]);
  
  // Re-join conversation when WebSocket reconnects
  useEffect(() => {
    console.log('🔍 useEffect check:', { 
      isConnected, 
      isConnectedType: typeof isConnected,
      conversation: conversation?.conversation_id, 
      isOpen,
      hasJoinFunc: typeof joinConversation === 'function'
    });
    
    if (isConnected && conversation && isOpen) {
      joinConversation(conversation.conversation_id);
      console.log('✅ Joined WebSocket room:', conversation.conversation_id);
    } else {
      if (!isConnected) console.log('⏳ WebSocket not connected yet, isConnected =', isConnected);
      if (!conversation) console.log('⏳ No conversation yet');
      if (!isOpen) console.log('⏳ Chat not open');
    }
  }, [isConnected, conversation, isOpen, joinConversation]);
  
  // Sync WebSocket messages to local state for real-time updates
  useEffect(() => {
    if (conversation && chatMessages[conversation.conversation_id]) {
      const wsMessages = chatMessages[conversation.conversation_id];
      
      // Only add new messages that aren't already in state
      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(m => m.message_id));
        const newMessages = wsMessages.filter(m => !existingIds.has(m.message_id));
        
        if (newMessages.length > 0) {
          console.log('📨 Adding', newMessages.length, 'new WebSocket messages');
          
          // If chat is closed, reload unread count to update badge
          if (!isOpen) {
            console.log('🔔 Chat closed - reloading unread count for badge');
            loadUnreadCount();
          }
          
          return [...prevMessages, ...newMessages];
        }
        
        return prevMessages;
      });
    }
  }, [chatMessages, conversation, isOpen, loadUnreadCount]);
  
  // Periodic unread count check when chat is closed
  useEffect(() => {
    if (!isOpen) {
      // Load initial count
      loadUnreadCount();
      
      // Set up interval to check every 5 seconds (matching AdminPanel)
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, loadUnreadCount]);
  
  // Listen for incoming messages via WebSocket
  useEffect(() => {
    if (!conversation || !isOpen) return;
    
    // TODO: Add WebSocket event listener for new messages
    // This would be handled by WebSocketContext emitting events
    // For now, messages are loaded via REST API
    
  }, [conversation, isOpen]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (conversation) {
        leaveConversation(conversation.conversation_id);
      }
    };
  }, [conversation, leaveConversation]);
  
  // Only show for instructors (role_id === 2)
  // Kiểm tra role để đảm bảo chỉ instructor mới thấy chat button
  if (!authState?.user || authState.user.role_id !== 2) {
    return null;
  }
  
  return (
    <>
      {/* Chat Toggle Button - Portal to escape overflow constraints */}
      {!isOpen && createPortal(
        <button
          onClick={toggleChat}
          className={`fixed flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl bg-indigo-600 hover:bg-indigo-700 ${className}`}
          style={{
            position: 'fixed',
            bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 4rem))',
            right: 'max(1.5rem, env(safe-area-inset-right))',
            width: 'clamp(52px, 4.5vw, 64px)',
            height: 'clamp(52px, 4.5vw, 64px)',
            borderRadius: '50%',
            border: 'none',
            color: '#ffffff',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          title="Chat with Admin Support"
        >
          <MessageCircle style={{ width: 'clamp(24px, 3.5vw, 28px)', height: 'clamp(24px, 3.5vw, 28px)' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-semibold">
              {unreadCount >= 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>,
        document.body
      )}
      
      {/* Chat Window - Portal to escape overflow constraints */}
      {isOpen && createPortal(
        <div 
          className="fixed z-[9999] rounded-lg shadow-2xl h-[480px] flex flex-col" 
          style={{
            bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 4rem))',
            right: 'max(1.5rem, env(safe-area-inset-right))',
            width: '380px',
            maxWidth: 'calc(100vw - 3rem)',
            backgroundColor: currentColors.card,
            borderColor: currentColors.border,
            border: `1px solid ${currentColors.border}`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {activeTab === 'active' ? 'Chat với Admin' : 'Đoạn chat đã lưu trữ'}
            </h3>
            <div className="flex gap-2">
              {/* Menu Dropdown */}
              {conversation && activeTab === 'active' && (
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="hover:bg-indigo-700 p-1 rounded transition-colors"
                    title="Menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleArchive();
                        }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Lưu trữ
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDelete();
                        }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={toggleChat} 
                className="hover:bg-indigo-700 p-1 rounded transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
              <div 
                className="flex border-b"
                style={{ 
                  backgroundColor: currentColors.card,
                  borderColor: currentColors.border
                }}
              >
                <button
                  onClick={async () => {
                    if (activeTab === 'archived') {
                      // Switching from archived to active
                      setActiveTab('active');
                      
                      // Only load if we don't already have an active conversation with messages
                      if (!conversation || messages.length === 0) {
                        setLoading(true);
                        await initializeConversation();
                        setLoading(false);
                      }
                    }
                    // If already on active tab, do nothing
                  }}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'hover:bg-opacity-10 hover:bg-gray-500'
                  }`}
                  style={{ color: activeTab === 'active' ? currentColors.primary : currentColors.textSecondary }}
                >
                  Đang hoạt động
                </button>
                <button
                  onClick={async () => {
                    if (activeTab === 'active') {
                      // Switching from active to archived
                      setActiveTab('archived');
                      setLoading(true);
                      await loadConversations('archived');
                      setLoading(false);
                    }
                    // If already on archived tab, do nothing
                  }}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'archived'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'hover:bg-opacity-10 hover:bg-gray-500'
                  }`}
                  style={{ color: activeTab === 'archived' ? currentColors.primary : currentColors.textSecondary }}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <Inbox className="w-4 h-4" />
                    Đã lưu trữ
                  </div>
                </button>
              </div>              {/* Messages or Archived List */}
              {activeTab === 'active' ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center mt-8" style={{ color: currentColors.textSecondary }}>
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Chưa có tin nhắn</p>
                        <p className="text-sm mt-2">Bắt đầu trò chuyện với admin!</p>
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
                              : `${theme === 'dark' ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} border`
                          }`}>
                            {msg.sender_id !== authState.user.user_id && (
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {msg.sender_role === 'admin' ? '👨‍💼 Admin' : msg.sender_name}
                              </p>
                            )}
                            <p className="text-sm break-words">{msg.message_text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                          borderColor: currentColors.border,
                          color: currentColors.text
                        }}
                        disabled={!isConnected || !conversation}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || !isConnected || !conversation}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Gửi tin nhắn"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    {!isConnected && (
                      <p className="text-xs text-red-500 mt-2">Mất kết nối. Đang kết nối lại...</p>
                    )}
                  </form>
                </>
              ) : (
                /* Archived Conversations List */
                <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center mt-12" style={{ color: currentColors.textSecondary }}>
                      <Inbox className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="font-medium text-base mb-2">Không có đoạn chat đã lưu trữ</p>
                      <p className="text-xs">Các đoạn chat đã lưu trữ sẽ hiển thị ở đây</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((conv) => (
                        <div
                          key={conv.conversation_id}
                          className="p-4 rounded-lg border transition-all"
                          style={{ 
                            backgroundColor: currentColors.card,
                            borderColor: currentColors.border
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-full" style={{ backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9' }}>
                                <User className="w-4 h-4" style={{ color: currentColors.primary }} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: currentColors.text }}>
                                  Admin Support
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" style={{ color: currentColors.textSecondary }} />
                                  <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                    {formatTime(conv.last_message_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRestore(conv.conversation_id)}
                              className="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                              style={{
                                backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
                                color: currentColors.primary
                              }}
                              title="Khôi phục đoạn chat"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Khôi phục
                            </button>
                          </div>
                          <div 
                            className="p-3 rounded-lg text-sm"
                            style={{ 
                              backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                              color: currentColors.textSecondary
                            }}
                          >
                            <p className="line-clamp-2">
                              {conv.last_message_text || 'Không có tin nhắn'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
        </div>,
        document.body
      )}
      
      {/* Confirmation Modal */}
      {confirmModal.open && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div 
            className="w-full max-w-md p-6 rounded-lg shadow-xl"
            style={{ 
              backgroundColor: currentColors.card,
              border: `1px solid ${currentColors.border}`
            }}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: currentColors.text }}>
              {confirmModal.title}
            </h3>
            <p className="mb-6" style={{ color: currentColors.textSecondary }}>
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ open: false, action: null, conversationId: null })}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{ 
                  borderColor: currentColors.border,
                  color: currentColors.text,
                  backgroundColor: currentColors.card
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmModal.isDangerous 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
