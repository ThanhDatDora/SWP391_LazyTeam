import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Performance Hook - Optimize component renders and data fetching
 */

// Debounce hook for search inputs
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized async state management
export const useOptimizedAsyncState = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialState);
    setError(null);
    setLoading(false);
  }, [initialState]);

  return { data, loading, error, execute, reset };
};

// Memoized data processing
export const useMemorizedData = (data, processor, dependencies = []) => {
  return useMemo(() => {
    if (!data) {return null;}
    return processor(data);
  }, [data, ...dependencies]);
};

// Performance monitoring hook  
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [targetRef, setTargetRef] = useState(null);

  useEffect(() => {
    if (!targetRef) {return;}

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(targetRef);

    return () => {
      if (targetRef) {observer.unobserve(targetRef);}
    };
  }, [targetRef, options]);

  return [setTargetRef, isIntersecting];
};

// Cache hook for API responses
export const useCache = (key, ttl = 300000) => { // 5 minutes default TTL
  const [cache, setCache] = useState(() => {
    const stored = sessionStorage.getItem(`cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < ttl) {
        return parsed.data;
      }
    }
    return null;
  });

  const updateCache = useCallback((data) => {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    setCache(data);
  }, [key]);

  const clearCache = useCallback(() => {
    sessionStorage.removeItem(`cache_${key}`);
    setCache(null);
  }, [key]);

  return [cache, updateCache, clearCache];
};

export default {
  useDebounce,
  useOptimizedAsyncState,
  useMemorizedData,
  usePerformanceMonitor,
  useIntersectionObserver,
  useCache
};