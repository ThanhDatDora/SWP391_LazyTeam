import React from 'react'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import AppRouter from '@/router/AppRouter'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function AppContent() {
  const { state, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check if current route is auth route
  const isAuthRoute = location.pathname.startsWith('/auth') || 
                     location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/register');

  // For auth routes, render without layout
  if (isAuthRoute) {
    return <AppRouter />;
  }

  // If not authenticated and not on auth route, show auth without layout
  if (!isAuthenticated() && !isAuthRoute) {
    return <AppRouter />;
  }

  // For regular routes with authenticated user, render with layout
  return (
    <AppLayout user={state.user}>
      <AppRouter />
    </AppLayout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
