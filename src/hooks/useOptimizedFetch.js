import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for optimized data fetching with deduplication and caching
 */
export const useOptimizedFetch = (fetchFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const requestTimeoutRef = useRef(null);
  
  const { 
    debounceMs = 300,  // Debounce requests
    cacheDuration = 5 * 60 * 1000, // 5 minutes cache
    retries = 2 
  } = options;

  const fetchData = async (isRetry = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear previous timeout
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    // Don't start new request if already loading (prevent duplicate calls)
    if (loading && !isRetry) {
      return;
    }

    // Debounce requests
    requestTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        const result = await fetchFunction();
        
        if (result.success) {
          setData(result.data);
          setError(null);
        } else {
          throw new Error(result.error || 'Fetch failed');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError(err.message);
          
          // Retry logic
          if (retries > 0 && !isRetry) {
            console.log(`🔄 Retrying request... (${retries} attempts left)`);
            setTimeout(() => {
              fetchData(true);
            }, 1000);
          }
        }
      } finally {
        setLoading(false);
      }
    }, isRetry ? 0 : debounceMs);
  };

  useEffect(() => {
    fetchData();
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  const forceRefresh = async () => {
    api.cache.clear();
    await fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
    forceRefresh
  };
};

/**
 * Hook specifically for courses with built-in optimization
 */
export const useCourses = (params = {}) => {
  const fetchCourses = async () => {
    return await api.courses.getCourses(params);
  };

  return useOptimizedFetch(
    fetchCourses, 
    [JSON.stringify(params)], // Re-fetch when params change
    { debounceMs: 500 } // Longer debounce for courses
  );
};

/**
 * Hook for single course with optimization
 */
export const useCourse = (courseId) => {
  const fetchCourse = async () => {
    if (!courseId) return { success: true, data: null };
    return await api.courses.getCourseById(courseId);
  };

  return useOptimizedFetch(
    fetchCourse,
    [courseId],
    { debounceMs: 200 }
  );
};