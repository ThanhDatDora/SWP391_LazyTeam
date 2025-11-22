/**
 * LearnerConversationList Component
 * Hiển thị danh sách conversations giữa learner và instructors
 * Giống ConversationList của admin nhưng cho learner
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, User, BookOpen, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useWebSocket } from '../../contexts/WebSocketContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function LearnerConversationList({ onSelectConversation, activeConversationId, onReloadConversations }) {
  const { isConnected, getSocket } = useWebSocket();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
    // Expose fetchConversations to parent
    if (onReloadConversations) {
      onReloadConversations(fetchConversations);
    }
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/learner/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
        setFilteredConversations(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket: Listen for conversation updates
  useEffect(() => {
    if (!isConnected) {
      console.log('⚠️ LearnerConversationList: WebSocket not connected yet');
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.warn('⚠️ LearnerConversationList: Socket not available');
      return;
    }

    console.log('🔌 LearnerConversationList: Setting up WebSocket listeners');

    const handleConversationUpdate = () => {
      fetchConversations();
    };

    const handleNewMessage = (data) => {
      console.log('🔔 LearnerConversationList: New message received:', data);
      
      // Fetch lại conversations để có data mới nhất từ server
      // Thay vì increment local state (tránh race condition với mark as read)
      fetchConversations();
    };

    socket.on('conversation_updated', handleConversationUpdate);
    socket.on('learner_conversation_updated', handleConversationUpdate);
    socket.on('new_learner_chat_message', handleNewMessage);

    return () => {
      console.log('🔌 LearnerConversationList: Cleaning up WebSocket listeners');
      socket.off('conversation_updated', handleConversationUpdate);
      socket.off('learner_conversation_updated', handleConversationUpdate);
      socket.off('new_learner_chat_message', handleNewMessage);
    };
  }, [isConnected, getSocket]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conv =>
      conv.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);
  
  // Handle conversation selection with mark as read
  const handleSelectConversation = async (conv) => {
    // Call parent handler first to show conversation immediately
    onSelectConversation(conv);
    
    // Mark conversation as read if it has unread messages (async, non-blocking)
    if (conv.unread_count > 0) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/chat/conversations/${conv.conversation_id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Marked conversation', conv.conversation_id, 'as read');
        
        // Clear unread count locally immediately
        setConversations(prev => prev.map(c => 
          c.conversation_id === conv.conversation_id 
            ? { ...c, unread_count: 0 } 
            : c
        ));
        setFilteredConversations(prev => prev.map(c => 
          c.conversation_id === conv.conversation_id 
            ? { ...c, unread_count: 0 } 
            : c
        ));
      } catch (error) {
        console.error('❌ Error marking conversation as read:', error);
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    }}>
      {/* Header với gradient giống AdminPanel */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
        padding: '20px 24px',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <MessageCircle size={24} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Chat với Giảng viên
          </h2>
        </div>
        
        {/* Search Box */}
        <div style={{ position: 'relative' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} 
          />
          <input
            type="text"
            placeholder="Tìm kiếm giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#111827',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />

        </div>
      </div>

      {/* Conversations List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {isLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Đang tải...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ margin: 0, marginBottom: '8px', fontWeight: '500' }}>
              Chưa có tin nhắn nào
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {searchTerm ? 'Không tìm thấy kết quả' : 'Bắt đầu chat với giảng viên từ các khóa học của bạn'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conv => (
            <div
              key={conv.conversation_id}
              onClick={() => handleSelectConversation(conv)}
              style={{
                padding: '16px',
                marginBottom: '4px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: activeConversationId === conv.conversation_id ? '#eff6ff' : '#ffffff',
                borderLeft: activeConversationId === conv.conversation_id ? '4px solid #4f46e5' : '4px solid transparent',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f9fafb'
                }
              }}
              onMouseEnter={(e) => {
                if (activeConversationId !== conv.conversation_id) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeConversationId !== conv.conversation_id) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {conv.instructor_name?.charAt(0).toUpperCase() || 'I'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '15px', 
                      fontWeight: '600',
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conv.instructor_name || 'Giảng viên'}
                    </h4>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>

                  {/* Course Count */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px'
                  }}>
                    <BookOpen size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                    <span style={{
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      {conv.course_count || 0} khóa học
                    </span>
                  </div>

                  {/* Last Message */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {conv.last_message || 'Chưa có tin nhắn'}
                    </p>
                    
                    {conv.unread_count > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px',
                        flexShrink: 0
                      }}>
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
