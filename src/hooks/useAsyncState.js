import { useState } from 'react';

/**
 * Custom hook for standardized error and loading state management
 */
export const useAsyncState = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = async (asyncFunction) => {
    try {
      setLoading(true);
      setError('');
      const result = await asyncFunction();
      
      if (result?.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result?.error || 'Operation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(initialState);
    setError('');
    setLoading(false);
  };

  const clearError = () => setError('');

  return {
    data,
    loading,
    error,
    execute,
    reset,
    clearError,
    setData,
    setLoading,
    setError
  };
};

/**
 * Error boundary component for catching React errors
 */
export const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  if (hasError) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Có lỗi không mong muốn xảy ra'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * Global error handler for API responses
 */
export const handleApiError = (error, setError) => {
  console.error('API Error:', error);
  
  if (error?.response?.status === 401) {
    // Handle unauthorized
    localStorage.removeItem('authToken');
    window.location.href = '/auth';
    return;
  }
  
  if (error?.response?.status === 403) {
    setError('Bạn không có quyền thực hiện hành động này');
    return;
  }
  
  if (error?.response?.status >= 500) {
    setError('Lỗi server. Vui lòng thử lại sau.');
    return;
  }
  
  const message = error?.message || error?.response?.data?.message || 'Đã có lỗi xảy ra';
  setError(message);
};