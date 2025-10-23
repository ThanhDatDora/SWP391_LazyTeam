/**
 * Real-time Chat Component
 * Course-specific chat with typing indicators and real-time messaging
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, Loader2 } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';

export function CourseChat({ courseId, className = '' }) {
  const { 
    sendMessage, 
    startTyping, 
    stopTyping,
    getCourseMessages,
    getTypingUsers,
    getCourseStats,
    isConnected 
  } = useWebSocket();
  
  const { state: authState } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const messages = getCourseMessages(courseId);
  const typingUsers = getTypingUsers(courseId);
  const courseStats = getCourseStats(courseId);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  const handleTyping = (value) => {
    setMessage(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      startTyping(courseId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(courseId);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) {return;}

    // Send message
    sendMessage(courseId, message.trim());
    
    // Clear input and stop typing
    setMessage('');
    setIsTyping(false);
    stopTyping(courseId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message) => {
    return message.userId === authState.user?.id;
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Course Chat</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <Badge variant="secondary" className="text-xs">
            {courseStats.activeUsers} online
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start a conversation with your classmates!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                isOwnMessage(msg)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {!isOwnMessage(msg) && (
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    {msg.userEmail?.split('@')[0] || 'Anonymous'}
                  </div>
                )}
                <div className="text-sm break-words">{msg.message}</div>
                <div className={`text-xs mt-1 ${
                  isOwnMessage(msg) ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatMessageTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {typingUsers.length === 1 
                    ? 'Someone is typing...' 
                    : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!isConnected}
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || !isConnected}
            className="px-3"
          >
            {isConnected ? (
              <Send className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </Button>
        </form>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Disconnected from chat service. Reconnecting...
          </p>
        )}
      </div>
    </div>
  );
}

export function ChatToggle({ courseId, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { getCourseMessages, isConnected } = useWebSocket();
  const messages = getCourseMessages(courseId);

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-40 rounded-full shadow-lg ${className}`}
        size="lg"
      >
        <MessageCircle className="h-5 w-5" />
        {messages.length > 0 && (
          <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs">
            {messages.length}
          </Badge>
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 z-50 shadow-xl">
          <CourseChat courseId={courseId} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute -top-2 -right-2 rounded-full bg-gray-600 text-white hover:bg-gray-700"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-20" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export function ChatSidebar({ courseId, className = '' }) {
  const { isConnected, getCourseStats } = useWebSocket();
  const courseStats = getCourseStats(courseId);

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Discussion</h3>
          <Badge variant={isConnected ? 'success' : 'destructive'} className="text-xs">
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        {isConnected && (
          <p className="text-sm text-gray-600">
            {courseStats.activeUsers} student{courseStats.activeUsers !== 1 ? 's' : ''} online
          </p>
        )}
      </div>

      <CourseChat courseId={courseId} className="h-full" />
    </div>
  );
}