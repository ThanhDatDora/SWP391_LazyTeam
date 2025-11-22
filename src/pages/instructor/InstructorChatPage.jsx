/**
 * InstructorChatPage Component
 * Chat interface for instructors with learners
 * 2-column layout: InstructorConversationList + ChatBox (giống LearnerChatPage)
 */

import React, { useState } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import InstructorConversationList from '../../components/chat/InstructorConversationList';
import ChatBox from '../../components/chat/ChatBox';
import { MessageCircle } from 'lucide-react';

export default function InstructorChatPage() {
  const { joinConversation, leaveConversation } = useWebSocket();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [reloadConversations, setReloadConversations] = useState(null);

  // Callback để reload conversation list sau khi mark as read
  const handleMarkAsRead = () => {
    console.log('🔄 InstructorChatPage: Reloading conversation list after mark as read');
    if (reloadConversations) {
      reloadConversations();
    }
  };

  // Receive reload function from InstructorConversationList
  const handleReloadConversations = (reloadFn) => {
    setReloadConversations(() => reloadFn);
  };

  const handleSelectConversation = (conversation) => {
    console.log('📌 InstructorChatPage: Selecting conversation:', {
      conversation_id: conversation.conversation_id,
      type: typeof conversation.conversation_id
    });
    
    // Leave previous conversation if any
    if (selectedConversation) {
      leaveConversation(selectedConversation.conversation_id);
    }
    
    // Join new conversation immediately (matching ConversationsPage pattern)
    joinConversation(conversation.conversation_id);
    console.log('✅ InstructorChatPage: Joined conversation room:', conversation.conversation_id);
    
    setSelectedConversation(conversation);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      backgroundColor: '#f9fafb'
    }}>
      {/* Left Sidebar: Conversations List */}
      <div style={{
        width: '380px',
        height: '100%',
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        flexShrink: 0
      }}>
        <InstructorConversationList
          onSelectConversation={handleSelectConversation}
          activeConversationId={selectedConversation?.conversation_id}
          onReloadConversations={handleReloadConversations}
        />
      </div>

      {/* Right Panel: ChatBox */}
      <div style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden'
      }}>
        {selectedConversation ? (
          <ChatBox
            conversationId={selectedConversation.conversation_id}
            chatType="learner-instructor"
            fullScreen={true}
            onMarkAsRead={handleMarkAsRead}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            padding: '40px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              opacity: 0.1
            }}>
              <MessageCircle size={60} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Chưa có tin nhắn nào
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin với học viên
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
