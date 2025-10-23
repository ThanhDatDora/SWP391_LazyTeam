import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Modern Toast Notification System
 */

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      dismissible: true,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss toast
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ 
      type: 'loading', 
      message, 
      duration: 0, 
      dismissible: false,
      ...options 
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      removeAllToasts,
      success,
      error,
      warning,
      info,
      loading
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) {return null;}

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onDismiss }) => {
  const { type, message, title, action, dismissible } = toast;

  const getToastStyles = () => {
    const baseStyles = 'flex items-start space-x-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transform transition-all duration-300 ease-out animate-in slide-in-from-right';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'loading':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`;
    }
  };

  const getIcon = () => {
    const iconClass = 'w-5 h-5 flex-shrink-0 mt-0.5';
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case 'loading':
        return <div className={`${iconClass} animate-spin rounded-full border-2 border-blue-600 border-t-transparent`} />;
      default:
        return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
        )}
        <p className="text-sm leading-5">{message}</p>
        
        {action && (
          <div className="mt-3">
            <button
              onClick={action.onClick}
              className="text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Toast Hook for easy usage
 */
export const useToastNotifications = () => {
  const toast = useToast();

  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options), 
    warning: (message, options) => toast.warning(message, options),
    info: (message, options) => toast.info(message, options),
    loading: (message, options) => toast.loading(message, options),
    dismiss: (id) => toast.removeToast(id),
    dismissAll: () => toast.removeAllToasts()
  };
};

/**
 * Custom Toast Variants
 * Note: These are NOT hooks, they are helper functions to create toast configs
 * Use with the toast object from useToast hook:
 * const toast = useToast();
 * toast.success(createSuccessToast('Message'));
 */
export const createSuccessToast = (message, options = {}) => ({
  type: 'success',
  title: 'Thành công!',
  message,
  ...options
});

export const createErrorToast = (message, options = {}) => ({
  type: 'error',
  title: 'Đã xảy ra lỗi',
  message,
  ...options
});

export const createWarningToast = (message, options = {}) => ({
  type: 'warning',
  title: 'Cảnh báo',
  message,
  ...options
});

export const createInfoToast = (message, options = {}) => ({
  type: 'info',
  title: 'Thông báo',
  message,
  ...options
});

export const createLoadingToast = (message, options = {}) => ({
  type: 'loading',
  title: 'Đang xử lý...',
  message,
  ...options
});

export default {
  ToastProvider,
  useToast,
  useToastNotifications,
  createSuccessToast,
  createErrorToast,
  createWarningToast,
  createInfoToast,
  createLoadingToast
};