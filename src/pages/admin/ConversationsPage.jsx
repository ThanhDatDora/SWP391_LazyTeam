import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, User, Clock, Send, X, RefreshCw, CheckCircle, ArrowLeft, Archive, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../contexts/WebSocketContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function ConversationsPage() {
  const navigate = useNavigate();
  // Use localStorage-based theme matching AdminPanel
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved || 'light';
  });
  const { joinConversation, leaveConversation, sendChatMessage, isConnected, chatMessages, getSocket } = useWebSocket();
  
  // Listen to custom theme change event - NO DELAY
  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail?.theme || localStorage.getItem('adminTheme') || 'light';
      setTheme(newTheme);
    };
    
    // Listen to custom event dispatched when theme toggles
    window.addEventListener('adminThemeChanged', handleThemeChange);
    
    // Also check localStorage on mount
    const currentTheme = localStorage.getItem('adminTheme') || 'light';
    if (currentTheme !== theme) {
      setTheme(currentTheme);
    }
    
    return () => window.removeEventListener('adminThemeChanged', handleThemeChange);
  }, []);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [unreadCount, setUnreadCount] = useState(0); // Track unread conversations count
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, conversationId: null });
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const activeTabRef = useRef(activeTab); // Ref to track current tab without causing re-renders
  const selectedConvRef = useRef(selectedConv); // Ref to track selected conversation
  const shouldScrollRef = useRef(false); // Flag to force scroll when user sends message
  const token = localStorage.getItem('token');
  
  // Helper function to format datetime from SQL Server (handles timezone correctly)
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    // SQL Server returns datetime without timezone (local server time)
    // Parse it and format directly without UTC conversion
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };
  
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
  
  // Keep refs in sync with state
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);
  
  // Theme colors matching AdminPanel
  const currentColors = {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    card: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    text: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    textSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
    primary: theme === 'dark' ? '#6366f1' : '#4f46e5',
    accent: theme === 'dark' ? '#22d3ee' : '#06b6d4',
    hover: theme === 'dark' ? '#334155' : '#f1f5f9'
  };
  
  // Check if user is near bottom of scroll (within 100px)
  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Scroll to bottom (scroll container only, not page)
  const scrollToBottom = useCallback(() => {
    console.log('🎯 scrollToBottom called, ref:', messagesContainerRef.current);
    if (messagesContainerRef.current) {
      console.log('✅ Scrolling - scrollHeight:', messagesContainerRef.current.scrollHeight);
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      console.error('❌ messagesContainerRef.current is null!');
    }
  }, []);
  
  // Load unread count (always from active conversations)
  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations?status=active&_t=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      
      if (data.success) {
        const count = data.data.filter(c => c.unread_count > 0).length;
        setUnreadCount(count);
        console.log('🔔 Unread conversations:', count);
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  }, [token]);
  
  // Load conversations
  const loadConversations = useCallback(async (statusFilter = 'active') => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/chat/conversations?status=${statusFilter}&_t=${Date.now()}`;
      
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setConversations(data.data);
        console.log('✅ Loaded', data.data.length, 'conversations with status:', statusFilter);
        
        // Update unread count if loading active tab
        if (statusFilter === 'active') {
          const count = data.data.filter(c => c.unread_count > 0).length;
          setUnreadCount(count);
        }
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    loadConversations(activeTab); // Pass 'active' or 'archived'
  }, [activeTab]);
  
  // Load unread count on mount and periodically
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);
  
  // Sync WebSocket messages to local state for real-time updates
  useEffect(() => {
    if (selectedConv && chatMessages[selectedConv.conversation_id]) {
      const wsMessages = chatMessages[selectedConv.conversation_id];
      
      // Check if user was near bottom before adding new messages
      const wasNearBottom = isNearBottom();
      
      // Only add new messages that aren't already in state
      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(m => m.message_id));
        const newMessages = wsMessages.filter(m => !existingIds.has(m.message_id));
        
        if (newMessages.length > 0) {
          console.log('📨 Adding', newMessages.length, 'new WebSocket messages');
          
          // Get current user ID from token
          const tokenData = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
          const currentUserId = parseInt(tokenData.userId);
          
          // Check if any new message is from current user
          const hasOwnMessage = newMessages.some(msg => msg.sender_id === currentUserId);
          
          console.log('🔍 ConversationsPage Scroll decision:', {
            wasNearBottom,
            hasOwnMessage,
            shouldScrollRef: shouldScrollRef.current,
            currentUserId,
            newMessageSenderIds: newMessages.map(m => m.sender_id),
            willScroll: wasNearBottom || hasOwnMessage || shouldScrollRef.current
          });
          
          // Only auto-scroll if:
          // 1. User was at bottom, OR
          // 2. Message is from current user, OR
          // 3. shouldScrollRef flag is set (user just sent message or selected conversation)
          if (wasNearBottom || hasOwnMessage || shouldScrollRef.current) {
            console.log('✅ ConversationsPage: Scrolling to bottom');
            setTimeout(() => scrollToBottom(), 100);
            shouldScrollRef.current = false; // Reset flag
          } else {
            console.log('⏭️ ConversationsPage: Skip scroll - user not at bottom');
          }
          
          return [...prevMessages, ...newMessages];
        }
        
        return prevMessages;
      });
    }
  }, [chatMessages, selectedConv, isNearBottom, scrollToBottom]);
  
  // Mark as read when user scrolls near bottom
  useEffect(() => {
    if (!selectedConv || !messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    
    const handleScroll = () => {
      // If user is near bottom, mark conversation as read
      if (isNearBottom()) {
        const hasUnread = conversations.find(
          c => c.conversation_id === selectedConv.conversation_id
        )?.unread_count > 0;
        
        if (hasUnread) {
          console.log('🔔 Marking conversation as read (scrolled to bottom)');
          markAsRead(selectedConv.conversation_id);
        }
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedConv, conversations, isNearBottom]);
  
  // Scroll to bottom when messages first load (after selecting conversation or clicking chat button)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current && shouldScrollRef.current) {
      console.log('📜 Initial scroll - messages loaded, scrolling to bottom');
      setTimeout(() => {
        scrollToBottom();
        shouldScrollRef.current = false; // Reset flag after scrolling
      }, 100);
    }
  }, [messages.length, scrollToBottom]);
  
  // Scroll AdminPanel's main window down when conversation is selected
  // This ensures the input field is visible without manual scrolling
  useEffect(() => {
    if (selectedConv) {
      // Wait for messages to render, then scroll window to show input field
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
        console.log('📜 Scrolling AdminPanel window to bottom to show input field');
      }, 100);
    }
  }, [selectedConv]);
  
  // WebSocket event handlers wrapped in useCallback to prevent recreating listeners
  const handleConversationDeleted = useCallback((data) => {
    console.log('🗑️ Conversation deleted:', data.conversation_id);
    loadConversations(activeTabRef.current);
    loadUnreadCount();
    if (selectedConvRef.current?.conversation_id === data.conversation_id) {
      setSelectedConv(null);
      setMessages([]);
    }
  }, [loadConversations, loadUnreadCount]);
  
  const handleConversationArchived = useCallback((data) => {
    console.log('📦 Conversation archived:', data.conversation_id);
    loadConversations(activeTabRef.current);
    loadUnreadCount();
    if (activeTabRef.current === 'active' && selectedConvRef.current?.conversation_id === data.conversation_id) {
      setSelectedConv(null);
      setMessages([]);
    }
  }, [loadConversations, loadUnreadCount]);
  
  const handleConversationRestored = useCallback((data) => {
    console.log('♻️ Conversation restored:', data.conversation_id);
    loadConversations(activeTabRef.current);
    loadUnreadCount();
  }, [loadConversations, loadUnreadCount]);
  
  const handleConversationUpdated = useCallback((data) => {
    const currentTab = activeTabRef.current;
    console.log('🔄 Conversation updated:', data.conversation_id);
    console.log('🔄 Current tab (from ref):', currentTab);
    
    // Always reload unread count
    loadUnreadCount();
    
    // Reload conversations if on active tab
    if (currentTab === 'active') {
      console.log('🔄 Reloading active conversations...');
      loadConversations('active');
    } else {
      console.warn('⚠️ Not on active tab, skipping reload. Current tab:', currentTab);
    }
  }, [loadConversations, loadUnreadCount]);
  
  // Listen for WebSocket events (delete, archive, restore, update)
  useEffect(() => {
    if (!isConnected) {
      console.log('⚠️ Not connected, skipping WebSocket listeners');
      return;
    }
    
    // Get socket from context
    const socket = getSocket();
    console.log('🔌 Setting up WebSocket listeners, socket:', socket ? 'available' : 'null');
    
    if (!socket) {
      console.warn('⚠️ Socket not available for conversation events');
      return;
    }
    
    socket.on('conversation_deleted', handleConversationDeleted);
    socket.on('conversation_archived', handleConversationArchived);
    socket.on('conversation_restored', handleConversationRestored);
    socket.on('conversation_updated', handleConversationUpdated);
    
    console.log('✅ WebSocket listeners registered');
    
    return () => {
      console.log('🔌 Cleaning up WebSocket listeners');
      socket.off('conversation_deleted', handleConversationDeleted);
      socket.off('conversation_archived', handleConversationArchived);
      socket.off('conversation_restored', handleConversationRestored);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [isConnected, handleConversationDeleted, handleConversationArchived, handleConversationRestored, handleConversationUpdated]);
  
  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data);
        console.log('✅ Loaded', data.data.length, 'messages');
        // Scroll to bottom when loading initial messages - wait longer for DOM to render
        setTimeout(() => {
          scrollToBottom();
          console.log('📜 Auto-scroll after loading messages');
        }, 300);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };
  
  // Select conversation
  const handleSelectConversation = async (conv) => {
    // Leave previous conversation
    if (selectedConv) {
      leaveConversation(selectedConv.conversation_id);
    }
    
    setSelectedConv(conv);
    setMessages([]);
    
    // Set flag to scroll to bottom when messages load
    shouldScrollRef.current = true;
    
    // Join new conversation
    joinConversation(conv.conversation_id);
    
    // Auto-assign FIRST if not assigned (needed for access control)
    if (!conv.admin_id) {
      await assignToMe(conv.conversation_id);
      loadConversations('active'); // Reload active conversations
    }
    
    const hadUnread = conv.unread_count > 0;
    
    // Mark as read immediately to clear badge
    if (hadUnread) {
      markAsRead(conv.conversation_id);
    }
    
    // Load messages AFTER assignment (backend also marks as read here)
    await loadMessages(conv.conversation_id);
    
    // Emit event AFTER loadMessages completes (backend marks as read during GET)
    // This ensures AdminPanel reloads badge after all mark operations finish
    if (hadUnread) {
      window.dispatchEvent(new CustomEvent('chatMarkedAsRead'));
      console.log('📡 [After loadMessages] Emitted chatMarkedAsRead event');
    }
  };
  
  // Mark conversation as read
  const markAsRead = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/read`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        console.log('✅ Conversation marked as read:', conversationId);
        // Reload conversations to update unread count
        loadConversations(activeTabRef.current);
        loadUnreadCount();
        // Note: chatMarkedAsRead event now emitted in handleSelectConversation
      }
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
    }
  };
  
  // Assign to current admin
  const assignToMe = async (conversationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/assign`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        console.log('✅ Conversation assigned');
      }
    } catch (error) {
      console.error('❌ Error assigning conversation:', error);
    }
  };
  
  // Archive conversation
  const handleArchiveConversation = async (conversationId) => {
    setConfirmModal({
      open: true,
      action: 'archive',
      conversationId,
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
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ Conversation archived');
        loadConversations(activeTabRef.current);
        loadUnreadCount();
        if (selectedConvRef.current?.conversation_id === conversationId) {
          setSelectedConv(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('❌ Error archiving conversation:', error);
    } finally {
      setConfirmModal({ open: false, action: null, conversationId: null });
    }
  };
  
  // Delete conversation
  const handleDeleteConversation = async (conversationId) => {
    setConfirmModal({
      open: true,
      action: 'delete',
      conversationId,
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
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ Conversation deleted');
        loadConversations(activeTabRef.current);
        loadUnreadCount();
        if (selectedConvRef.current?.conversation_id === conversationId) {
          setSelectedConv(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
    } finally {
      setConfirmModal({ open: false, action: null, conversationId: null });
    }
  };
  
  // Restore conversation
  const handleRestoreConversation = async (conversationId) => {
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
      const data = await res.json();
      
      if (data.success) {
        console.log('✅ Conversation restored');
        loadConversations(activeTabRef.current);
        loadUnreadCount();
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
  
  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    
    // Set flag to force scroll when message arrives via WebSocket
    shouldScrollRef.current = true;
    
    try {
      setSending(true);
      const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${selectedConv.conversation_id}/messages`,
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
        // Don't add message here - let WebSocket event handle it to avoid duplicates
        // Backend already emits WebSocket event, so no need to call sendChatMessage
        setNewMessage('');
        console.log('✅ Message sent:', data.data.message_id, '- waiting for WebSocket event');
        
        // Auto-focus input after sending (fix: không phải click lại)
        setTimeout(() => {
          const inputElement = document.querySelector('input[placeholder="Type a message..."]');
          if (inputElement) {
            inputElement.focus();
          }
        }, 100);
      } else {
        // Reset flag if message failed
        shouldScrollRef.current = false;
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Reset flag on error
      shouldScrollRef.current = false;
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: currentColors.background }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 border-b shadow-sm"
        style={{ 
          backgroundColor: currentColors.card,
          borderColor: currentColors.border
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: currentColors.hover,
                  color: currentColors.text
                }}
                title="Quay lại Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: currentColors.text }}>
                  <MessageCircle className="w-7 h-7" style={{ color: currentColors.accent }} />
                  Hỗ trợ Giảng viên
                </h1>
                <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>
                  Quản lý tin nhắn và hỗ trợ giảng viên
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: currentColors.hover }}>
                <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                  {conversations.length} cuộc hội thoại
                </span>
              </div>
              <button
                onClick={loadConversations}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: currentColors.primary,
                  color: '#ffffff'
                }}
                title="Làm mới"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Conversations List */}
        <div 
          className="w-96 border-r flex flex-col"
          style={{ 
            backgroundColor: currentColors.card,
            borderColor: currentColors.border
          }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: currentColors.border }}>
            <button
              onClick={() => setActiveTab('active')}
              className="flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                color: activeTab === 'active' ? currentColors.primary : currentColors.textSecondary,
                borderBottom: activeTab === 'active' ? `2px solid ${currentColors.primary}` : '2px solid transparent',
                backgroundColor: activeTab === 'active' ? currentColors.hover : 'transparent'
              }}
            >
              Đang hoạt động
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className="flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                color: activeTab === 'archived' ? currentColors.primary : currentColors.textSecondary,
                borderBottom: activeTab === 'archived' ? `2px solid ${currentColors.primary}` : '2px solid transparent',
                backgroundColor: activeTab === 'archived' ? currentColors.hover : 'transparent'
              }}
            >
              <Archive className="w-4 h-4" />
              Đã lưu trữ
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: currentColors.primary }} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center mt-12 px-4">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: currentColors.textSecondary }} />
                <p className="font-medium" style={{ color: currentColors.text }}>
                  {activeTab === 'archived' ? 'Chưa có cuộc hội thoại đã lưu trữ' : 'Chưa có cuộc hội thoại'}
                </p>
                <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                  {activeTab === 'archived' 
                    ? 'Các cuộc hội thoại đã lưu trữ sẽ xuất hiện ở đây'
                    : 'Giảng viên sẽ xuất hiện ở đây khi bắt đầu chat'
                  }
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  className="relative border-b"
                  style={{ borderColor: currentColors.border }}
                >
                  <button
                    onClick={() => handleSelectConversation(conv)}
                    className="w-full text-left p-4 transition-all"
                    style={{ 
                      backgroundColor: selectedConv?.conversation_id === conv.conversation_id 
                        ? currentColors.hover 
                        : 'transparent'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
                        <span className="font-semibold" style={{ color: currentColors.text }}>
                          {conv.instructor_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {conv.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                      {conv.instructor_email}
                    </p>
                    
                    {conv.last_message && (
                      <p className="text-sm truncate mb-2" style={{ color: currentColors.textSecondary }}>
                        {conv.last_message}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs" style={{ color: currentColors.textSecondary }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(conv.last_message_at)}
                      </span>
                      {conv.admin_id && (
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="w-3 h-3" />
                          Đã phân công
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === conv.conversation_id ? null : conv.conversation_id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-opacity-20 transition-all"
                      style={{ 
                        backgroundColor: openDropdown === conv.conversation_id ? currentColors.hover : 'transparent',
                        color: currentColors.textSecondary
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openDropdown === conv.conversation_id && (
                      <div 
                        className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-10"
                        style={{
                          backgroundColor: currentColors.card,
                          borderColor: currentColors.border
                        }}
                      >
                        {activeTab === 'active' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveConversation(conv.conversation_id);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-10 transition-all"
                            style={{ color: currentColors.text }}
                          >
                            <Archive className="w-4 h-4" />
                            Lưu trữ
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreConversation(conv.conversation_id);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-10 transition-all text-green-600"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Khôi phục
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.conversation_id);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      
        {/* Chat Area */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: currentColors.background }}>
          {selectedConv ? (
          <>
            {/* Chat Header */}
            <div 
              className="p-4 border-b shadow-sm"
              style={{ 
                backgroundColor: currentColors.card,
                borderColor: currentColors.border
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: currentColors.text }}>
                    {selectedConv.instructor_name}
                  </h3>
                  <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                    {selectedConv.instructor_email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    leaveConversation(selectedConv.conversation_id);
                    setSelectedConv(null);
                    setMessages([]);
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: currentColors.hover,
                    color: currentColors.text
                  }}
                  title="Đóng cuộc hội thoại"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center mt-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: currentColors.textSecondary }} />
                  <p style={{ color: currentColors.textSecondary }}>Chưa có tin nhắn</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className="max-w-[70%] rounded-lg p-3 shadow-sm"
                      style={{
                        backgroundColor: msg.sender_role === 'admin' 
                          ? currentColors.primary 
                          : currentColors.card,
                        color: msg.sender_role === 'admin' 
                          ? '#ffffff' 
                          : currentColors.text,
                        border: msg.sender_role === 'admin' 
                          ? 'none' 
                          : `1px solid ${currentColors.border}`
                      }}
                    >
                      {msg.sender_role !== 'admin' && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          👨‍🏫 {msg.sender_name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
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
            <form 
              onSubmit={handleSendMessage} 
              className="p-4 border-t"
              style={{ 
                backgroundColor: currentColors.card,
                borderColor: currentColors.border
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                  disabled={!isConnected || sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected || sending}
                  className="px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  style={{
                    backgroundColor: currentColors.primary,
                    color: '#ffffff'
                  }}
                >
                  <Send className="w-5 h-5" />
                  Gửi
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">Mất kết nối. Đang kết nối lại...</p>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: currentColors.textSecondary }} />
              <p className="text-lg font-medium" style={{ color: currentColors.text }}>Chọn cuộc hội thoại</p>
              <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu chat
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: currentColors.card }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: currentColors.text }}
            >
              {confirmModal.title}
            </h3>
            <p 
              className="mb-6"
              style={{ color: currentColors.textSecondary }}
            >
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ open: false, action: null, conversationId: null })}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: currentColors.hover,
                  color: currentColors.text
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: confirmModal.isDangerous ? '#ef4444' : currentColors.primary,
                  color: 'white'
                }}
              >
                {confirmModal.action === 'delete' ? 'Xóa vĩnh viễn' : 
                 confirmModal.action === 'archive' ? 'Lưu trữ' : 'Khôi phục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
