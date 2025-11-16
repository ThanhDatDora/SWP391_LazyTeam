import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext';
import { ToastProvider } from './components/ui/Toast';
import AppRouter from './router/AppRouter';
import ApiDebugPanel from './components/debug/ApiDebugPanel';
import AccountLockedModal from './components/admin/AccountLockedModal';

// AppContent component để sử dụng useAuth và useWebSocket
function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, disconnect, isAccountLocked, resetAccountLocked } = useWebSocket(); // Dùng WebSocketContext

  // WebSocket đã được xử lý bởi WebSocketProvider, không cần setup ở đây nữa
  useEffect(() => {
    if (isConnected) {
      console.log('✅ WebSocket connected in App');
    }
  }, [isConnected]);

  // Listen for account locked event from WebSocket
  useEffect(() => {
    if (isAccountLocked) {
      console.log('🔒 Account locked detected in App');
    }
  }, [isAccountLocked]);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Disconnect socket through WebSocketContext
    disconnect();

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
        isOpen={isAccountLocked}
        onClose={() => resetAccountLocked()}
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
          <WebSocketProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
