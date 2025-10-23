import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';
import AppRouter from './router/AppRouter';
import ApiDebugPanel from './components/debug/ApiDebugPanel';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
          {/* Show debug panel in development */}
          {import.meta.env.DEV && <ApiDebugPanel />}
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
