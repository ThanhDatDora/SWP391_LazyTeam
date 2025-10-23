/**
 * Real-time Notifications Component
 * Displays live notifications with different types and actions
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, Users, MessageCircle, Trophy, AlertCircle, Info } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { Button } from './button';
import { Badge } from './badge';

export function NotificationCenter() {
  const { 
    notifications, 
    clearNotification, 
    clearAllNotifications,
    isConnected 
  } = useWebSocket();
  
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return <Users className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      case 'admin':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course':
        return 'bg-blue-500';
      case 'message':
        return 'bg-green-500';
      case 'achievement':
        return 'bg-yellow-500';
      case 'admin':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {return 'just now';}
    if (diffMins < 60) {return `${diffMins}m ago`;}
    if (diffMins < 1440) {return `${Math.floor(diffMins / 60)}h ago`;}
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Notifications</h3>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="p-3 bg-red-50 border-b">
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Real-time connection lost</span>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-xs mt-1">You'll see real-time updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => clearNotification(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)} text-white flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title || 'Notification'}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.courseId && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Course ID: {notification.courseId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t bg-gray-50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export function NotificationBanner() {
  const { notifications } = useWebSocket();
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    // Show the latest high-priority notification as a banner
    const latestImportant = notifications.find(
      n => n.type === 'admin' || n.type === 'achievement'
    );
    
    if (latestImportant && latestImportant !== currentNotification) {
      setCurrentNotification(latestImportant);
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);
    }
  }, [notifications, currentNotification]);

  if (!currentNotification) {return null;}

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${
      currentNotification.type === 'admin' ? 'bg-red-500' : 'bg-yellow-500'
    } text-white p-4 rounded-lg shadow-lg`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(currentNotification.type)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">
            {currentNotification.title || 'Important Notification'}
          </h4>
          <p className="text-sm opacity-90 mt-1">
            {currentNotification.message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentNotification(null)}
          className="text-white hover:bg-white/20 p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ConnectionStatus() {
  const { isConnected, isReconnecting, connectionError } = useWebSocket();

  if (isConnected) {return null;}

  return (
    <div className={`fixed bottom-4 left-4 z-50 p-3 rounded-lg shadow-lg ${
      isReconnecting ? 'bg-yellow-500' : 'bg-red-500'
    } text-white`}>
      <div className="flex items-center space-x-2">
        {isReconnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span className="text-sm">Reconnecting...</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {connectionError ? 'Connection failed' : 'Disconnected'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}