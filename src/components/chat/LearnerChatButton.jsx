/**
 * LearnerChatButton Component
 * Floating chat button for learners - Navigate to chat page
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function LearnerChatButton() {
  const navigate = useNavigation();
  const { state: authState } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch total unread count from all conversations
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/chat/learner/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
          const totalUnread = data.data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    if (authState.user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [authState.user]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    const socket = window.socketInstance;
    if (!socket) return;
    
    const handleNewMessage = () => {
      setUnreadCount(prev => prev + 1);
    };
    
    socket.on('new_learner_chat_message', handleNewMessage);
    
    return () => {
      socket.off('new_learner_chat_message', handleNewMessage);
    };
  }, []);

  const handleClick = () => {
    navigate('/learner/chat');
  };

  // Don't show if not logged in
  if (!authState.user) {
    return null;
  }

  return createPortal(
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        all: 'unset',
        position: 'fixed',
        bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 4rem))',
        right: 'max(1.5rem, env(safe-area-inset-right))',
        width: 'clamp(52px, 4.5vw, 64px)',
        height: 'clamp(52px, 4.5vw, 64px)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        backgroundColor: isHovered ? '#4338ca' : '#4f46e5',
        backgroundImage: 'none',
        border: 'none',
        outline: 'none',
        color: '#ffffff',
        boxShadow: '0 20px 60px rgba(79, 70, 229, 0.9), 0 0 0 6px rgba(79, 70, 229, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
        zIndex: 99999,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, background-color 0.3s ease',
        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        opacity: 1,
        visibility: 'visible',
        WebkitTapHighlightColor: 'transparent'
      }}
      title="Chat với Giảng viên"
    >
      <MessageCircle 
        style={{ 
          width: 'clamp(24px, 3.5vw, 28px)', 
          height: 'clamp(24px, 3.5vw, 28px)',
          color: '#ffffff',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
          pointerEvents: 'none'
        }} 
      />
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
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
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
            border: '2px solid #ffffff',
            pointerEvents: 'none'
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>,
    document.body
  );
}
