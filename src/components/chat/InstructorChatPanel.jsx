/**
 * InstructorChatPanel Component
 * Panel for instructors to view and respond to learner messages
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, User, BookOpen, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import ChatBox from './ChatBox';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function InstructorChatPanel({ className = '' }) {
  const { state: authState } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/chat/learner/instructor-conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
        setFilteredConversations(data.data);
        
        // Calculate total unread
        const unread = data.data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        setTotalUnread(unread);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState.user?.role === 'instructor') {
      fetchConversations();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchConversations, authState.user]);

  // WebSocket: Listen for conversation updates
  useEffect(() => {
    const socket = window.socketInstance;
    if (!socket) return;
    
    const handleUpdate = () => {
      fetchConversations();
    };
    
    socket.on('learner_conversation_updated', handleUpdate);
    socket.on('new_learner_chat_message', handleUpdate);
    
    return () => {
      socket.off('learner_conversation_updated', handleUpdate);
      socket.off('new_learner_chat_message', handleUpdate);
    };
  }, [fetchConversations]);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter(conv => 
        conv.learner_name?.toLowerCase().includes(query) ||
        conv.learner_email?.toLowerCase().includes(query) ||
        conv.course_title?.toLowerCase().includes(query) ||
        conv.last_message?.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

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
    return date.toLocaleDateString('vi-VN');
  };

  if (authState.user?.role !== 'instructor') {
    return null;
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white border-b border-blue-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Tin nhắn từ Học viên
            </h3>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white">
                {totalUnread}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Tìm kiếm học viên hoặc khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có tin nhắn từ học viên'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => setSelectedConversation(conv)}
                className="p-4 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-blue-600"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {conv.learner_name || 'Học viên'}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.course_title}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.last_message || 'Chưa có tin nhắn'}
                    </p>
                    
                    {conv.unread_count > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 mt-2">
                        {conv.unread_count} tin nhắn mới
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ChatBox */}
      {selectedConversation && (
        <ChatBox
          conversationId={selectedConversation.conversation_id}
          courseId={selectedConversation.course_id}
          chatType="learner-instructor"
          isOpen={true}
          onClose={() => {
            setSelectedConversation(null);
            fetchConversations(); // Refresh to update unread count
          }}
        />
      )}
    </div>
  );
}
