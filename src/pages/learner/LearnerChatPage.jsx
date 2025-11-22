/**
 * LearnerChatPage - Trang quản lý chat của Learner
 * Layout: Sidebar (danh sách conversations) + Main (chatbox)
 * Tương tự như ConversationsPage của admin
 */

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useWebSocket } from '../../contexts/WebSocketContext';
import LearnerNavbar from '../../components/layout/LearnerNavbar';
import Footer from '../../components/layout/Footer';
import LearnerConversationList from '../../components/chat/LearnerConversationList';
import ChatBox from '../../components/chat/ChatBox';

export default function LearnerChatPage() {
  const navigate = useNavigation();
  const { joinConversation, leaveConversation } = useWebSocket();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [reloadConversations, setReloadConversations] = useState(null);

  // Callback để reload conversation list sau khi mark as read
  const handleMarkAsRead = () => {
    console.log('🔄 LearnerChatPage: Reloading conversation list after mark as read');
    if (reloadConversations) {
      reloadConversations();
    }
  };

  // Receive reload function from LearnerConversationList
  const handleReloadConversations = (reloadFn) => {
    setReloadConversations(() => reloadFn);
  };

  const handleSelectConversation = (conversation) => {
    console.log('📌 LearnerChatPage: Selecting conversation:', {
      conversation_id: conversation.conversation_id,
      type: typeof conversation.conversation_id
    });
    
    // Leave previous conversation if any
    if (selectedConversation) {
      leaveConversation(selectedConversation.conversation_id);
    }
    
    // Join new conversation immediately (matching ConversationsPage pattern)
    joinConversation(conversation.conversation_id);
    console.log('✅ LearnerChatPage: Joined conversation room:', conversation.conversation_id);
    
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      <LearnerNavbar />
      
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px'
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <ArrowLeft size={20} style={{ color: '#6b7280' }} />
            </button>
            
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                color: '#111827'
              }}>
                Tin nhắn
              </h1>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Chat với giảng viên các khóa học của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div style={{ 
          flex: 1,
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: '24px',
          display: 'flex',
          gap: '24px'
        }}>
          {/* Sidebar - Conversations List */}
          <div style={{
            width: '380px',
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            height: 'calc(100vh - 240px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <LearnerConversationList
              onSelectConversation={handleSelectConversation}
              activeConversationId={selectedConversation?.conversation_id}
              onReloadConversations={handleReloadConversations}
            />
          </div>

          {/* Main - ChatBox */}
          <div style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            height: 'calc(100vh - 240px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedConversation ? (
              <div style={{ width: '100%', height: '100%' }}>
                <ChatBox
                  conversationId={selectedConversation.conversation_id}
                  chatType="learner-instructor"
                  isOpen={true}
                  onClose={handleCloseChat}
                  onMarkAsRead={handleMarkAsRead}
                  fullScreen={true}
                />
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: '#9ca3af'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  opacity: 0.2
                }}>
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Chọn một cuộc trò chuyện
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  textAlign: 'center',
                  maxWidth: '400px'
                }}>
                  Chọn một giảng viên từ danh sách bên trái để bắt đầu chat
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
