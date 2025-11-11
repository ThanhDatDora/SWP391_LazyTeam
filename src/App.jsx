import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/ui/Toast';
import AppRouter from './router/AppRouter';
import ApiDebugPanel from './components/debug/ApiDebugPanel';
import AccountLockedModal from './components/admin/AccountLockedModal';
import { io } from 'socket.io-client';

// AppContent component để sử dụng useAuth
function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [socket, setSocket] = useState(null);

  // Setup Socket.IO connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, skipping Socket.IO connection');
        return;
      }

      console.log('🔌 Initializing Socket.IO connection...');
      console.log('👤 User:', user);
      console.log('🔑 Token exists:', !!token);

      // Socket.IO server is at root URL, NOT /api
      const socketUrl = 'http://localhost:3001'; // Socket.IO always at root
      console.log('🔌 Connecting to Socket.IO at:', socketUrl);

      // Connect to WebSocket with proper auth
      const newSocket = io(socketUrl, {
        auth: { 
          token: token 
        },
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully:', newSocket.id);
        const userId = user.user_id || user.id;
        console.log('👤 Current user ID:', userId);
        console.log('👤 User will auto-join room: user:' + userId);
        // WebSocketService automatically joins user:userId room on connect
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected. Reason:', reason);
      });

      // Listen for account-locked event
      newSocket.on('account-locked', (data) => {
        console.log('🔒 ========== ACCOUNT LOCKED EVENT ==========');
        console.log('🔒 Full event data:', data);
        console.log('🔒 Data userId:', data.userId, 'Type:', typeof data.userId);
        
        const currentUserId = user.user_id || user.id;
        console.log('🔒 Current user ID:', currentUserId, 'Type:', typeof currentUserId);
        console.log('🔒 Strict match (===):', data.userId === currentUserId);
        console.log('🔒 Loose match (==):', data.userId == currentUserId);
        
        // Use == for flexible comparison (handles string vs number)
        if (data.userId == currentUserId) {
          console.log('⚠️⚠️⚠️ MATCH! Current user has been locked! Showing modal...');
          setShowLockedModal(true);
        } else {
          console.log('ℹ️ Event for different user, ignoring');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error type:', error.type);
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('🔌 Cleaning up socket connection...');
        newSocket.disconnect();
      };
    } else {
      console.log('⚠️ Not authenticated or no user, skipping Socket.IO');
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }

    // Call logout from AuthContext
    logout();
  };

  return (
    <>
      <AppRouter />
      {/* Show debug panel in development */}
      {import.meta.env.DEV && <ApiDebugPanel />}
      
      {/* Account Locked Modal - Show when user is locked */}
      <AccountLockedModal
        isOpen={showLockedModal}
        onClose={() => setShowLockedModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
