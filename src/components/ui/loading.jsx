import React from 'react';

/**
 * Modern loading spinner with multiple variants
 */
export const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'spin', 
  color = 'teal', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    teal: 'border-teal-600',
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-${color}-600 rounded-full animate-bounce`} />
        <div className={`${sizeClasses[size]} bg-${color}-600 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }} />
        <div className={`${sizeClasses[size]} bg-${color}-600 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-${color}-600 rounded-full animate-pulse ${className}`} />
    );
  }

  // Default spin variant
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 ${colorClasses[color]} ${sizeClasses[size]} ${className}`} />
  );
};

/**
 * Full page loading component
 */
export const PageLoader = ({ message = 'Đang tải...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="large" className="mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Section loading component
 */
export const SectionLoader = ({ message = 'Đang tải...', className = '' }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="text-center">
      <LoadingSpinner className="mx-auto mb-2" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Inline loading component for buttons
 */
export const ButtonLoader = ({ className = '' }) => (
  <LoadingSpinner size="small" className={`mr-2 ${className}`} />
);

/**
 * Empty state component
 */
export const EmptyState = ({ 
  title = 'Không có dữ liệu', 
  message = 'Không tìm thấy dữ liệu nào', 
  action,
  className = '' 
}) => (
  <div className={`text-center p-8 ${className}`}>
    <div className="text-gray-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    {action}
  </div>
);

/**
 * Error display component
 */
export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  className = '',
  title = 'Đã xảy ra lỗi' 
}) => (
  <div className={`text-center p-8 ${className}`}>
    <div className="text-red-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-red-600 mb-4">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
      >
        Thử lại
      </button>
    )}
  </div>
);