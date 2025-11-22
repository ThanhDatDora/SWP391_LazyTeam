import { useEffect } from 'react';
import { api } from '../services/api';

/**
 * Hook to clear cache when component unmounts or when specific conditions are met
 */
export const useCacheClear = (patterns = [], clearOnUnmount = false) => {
  useEffect(() => {
    return () => {
      if (clearOnUnmount) {
        if (patterns.length > 0) {
          patterns.forEach(pattern => {
            api.cache.clearPattern(pattern);
          });
        } else {
          api.cache.clear();
        }
      }
    };
  }, [patterns, clearOnUnmount]);

  const clearCache = (pattern) => {
    if (pattern) {
      api.cache.clearPattern(pattern);
    } else {
      api.cache.clear();
    }
  };

  const forceRefresh = async () => {
    api.cache.clear();
    window.location.reload();
  };

  return { clearCache, forceRefresh };
};

/**
 * Hook to add refresh button functionality
 */
export const useRefresh = () => {
  const { clearCache, forceRefresh } = useCacheClear();

  const handleRefresh = () => {
    clearCache();
    // Trigger re-render by clearing cache
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleSoftRefresh = () => {
    clearCache();
    // Components will automatically refetch when cache is cleared
  };

  return { handleRefresh, handleSoftRefresh, forceRefresh };
};