import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Clock, Send, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function ConversationsPage() {
  const { joinConversation, leaveConversation, sendChatMessage, isConnected } = useWebSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setConversations(data.data);
        console.log('✅ Loaded', data.data.length, 'conversations');
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadConversations();
  }, []);
  
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
    
    // Join new conversation
    joinConversation(conv.conversation_id);
    
    // Load messages
    await loadMessages(conv.conversation_id);
    
    // Auto-assign if not assigned
    if (!conv.admin_id) {
      await assignToMe(conv.conversation_id);
      loadConversations(); // Reload to update UI
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
  
  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    
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
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Send via WebSocket
        sendChatMessage(selectedConv.conversation_id, data.data);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Conversations List */}
      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-inherit flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Support Conversations
            </h2>
            <button
              onClick={loadConversations}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500 mt-12 px-4">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-2">Instructors will appear here when they start a chat</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversation_id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedConv?.conversation_id === conv.conversation_id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-inherit">{conv.instructor_name}</span>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {conv.instructor_email}
                </p>
                
                {conv.last_message && (
                  <p className="text-sm text-gray-500 truncate mb-2">
                    {conv.last_message}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.last_message_at).toLocaleString('vi-VN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {conv.admin_id && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Assigned
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-inherit">
                    {selectedConv.instructor_name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedConv.instructor_email}</p>
                </div>
                <button
                  onClick={() => {
                    leaveConversation(selectedConv.conversation_id);
                    setSelectedConv(null);
                    setMessages([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close conversation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_role === 'admin'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {msg.sender_role !== 'admin' && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          👨‍🏫 {msg.sender_name}
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
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={!isConnected || sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected || sending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">Disconnected. Reconnecting...</p>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">Choose a conversation from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
