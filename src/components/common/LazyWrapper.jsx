import React, { Suspense } from 'react';
import LoadingSpinner from '../ui/loading';

/**
 * LazyWrapper - Component wrapper để lazy load components
 * Giúp code splitting và cải thiện performance
 */
const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;