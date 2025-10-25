import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/ui/Toast';
import AppRouter from './router/AppRouter';
import ApiDebugPanel from './components/debug/ApiDebugPanel';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRouter />
            {/* Show debug panel in development */}
            {import.meta.env.DEV && <ApiDebugPanel />}
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
