/**
 * Enhanced API Service with Caching, Error Handling, and Performance
 * Includes retry logic, request deduplication, and intelligent caching
 */

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Advanced caching system
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  generateKey(endpoint, options = {}) {
    const { method = 'GET', body = null } = options;
    return `${method}:${endpoint}:${JSON.stringify(body)}`;
  }

  set(key, data, ttl = DEFAULT_CACHE_TTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
    
    // Auto cleanup expired entries
    setTimeout(() => {
      if (this.cache.has(key)) {
        const entry = this.cache.get(key);
        if (entry && Date.now() > entry.expiry) {
          this.cache.delete(key);
        }
      }
    }, ttl);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {return null;}
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  // Request deduplication
  setPendingRequest(key, promise) {
    this.pendingRequests.set(key, promise);
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
    return promise;
  }

  getPendingRequest(key) {
    return this.pendingRequests.get(key);
  }
}

// Global cache instance
const apiCache = new ApiCache();

// Token management with enhanced security
const TokenManager = {
  getToken() {
    return localStorage.getItem('authToken');
  },

  setToken(token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenTimestamp', Date.now().toString());
  },

  removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenTimestamp');
  },

  isTokenExpired() {
    const timestamp = localStorage.getItem('tokenTimestamp');
    if (!timestamp) {return true;}
    
    // Assume token expires after 24 hours
    const tokenAge = Date.now() - parseInt(timestamp);
    return tokenAge > 24 * 60 * 60 * 1000;
  },

  refreshTokenIfNeeded() {
    if (this.isTokenExpired()) {
      this.removeToken();
      // Redirect to login or refresh token
      return false;
    }
    return true;
  }
};

// Enhanced retry logic
const retryWithBackoff = async (fn, maxAttempts = MAX_RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain errors
      if (error.status === 401 || error.status === 403 || error.status === 404) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Enhanced API request function
const enhancedApiRequest = async (
  endpoint, 
  options = {}, 
  cacheConfig = { enabled: true, ttl: DEFAULT_CACHE_TTL }
) => {
  const { method = 'GET', body, headers = {}, ...restOptions } = options;
  const cacheKey = apiCache.generateKey(endpoint, { method, body });

  // Check cache for GET requests
  if (method === 'GET' && cacheConfig.enabled) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return { success: true, data: cachedData, fromCache: true };
    }

    // Check for pending request to avoid duplicates
    const pendingRequest = apiCache.getPendingRequest(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }
  }

  // Check token validity
  if (!TokenManager.refreshTokenIfNeeded()) {
    return {
      success: false,
      error: 'Token expired',
      status: 401
    };
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = TokenManager.getToken();

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers
    },
    ...(body && { body: JSON.stringify(body) }),
    ...restOptions
  };

  const makeRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return { success: true, data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  };

  const requestPromise = retryWithBackoff(makeRequest);

  // Store pending request for deduplication
  if (method === 'GET' && cacheConfig.enabled) {
    apiCache.setPendingRequest(cacheKey, requestPromise);
  }

  try {
    const result = await requestPromise;

    // Cache successful GET requests
    if (method === 'GET' && cacheConfig.enabled && result.success) {
      apiCache.set(cacheKey, result.data, cacheConfig.ttl);
    }

    // Invalidate related cache entries for mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const resourcePath = endpoint.split('/')[1];
      apiCache.invalidate(resourcePath);
    }

    return result;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    
    return {
      success: false,
      error: error.message || 'Network error occurred',
      status: error.status || 500
    };
  }
};

// Enhanced Auth API
export const enhancedAuthAPI = {
  async login(email, password) {
    const result = await enhancedApiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    }, { enabled: false }); // Don't cache login requests

    if (result.success && result.data?.token) {
      TokenManager.setToken(result.data.token);
    }

    return result;
  },

  async register(userData) {
    return await enhancedApiRequest('/auth/register', {
      method: 'POST',
      body: userData
    }, { enabled: false });
  },

  async logout() {
    const result = await enhancedApiRequest('/auth/logout', {
      method: 'POST'
    }, { enabled: false });
    
    TokenManager.removeToken();
    apiCache.clear(); // Clear all cache on logout
    
    return result;
  },

  async getCurrentUser() {
    return await enhancedApiRequest('/auth/profile', {}, {
      ttl: 2 * 60 * 1000 // Cache profile for 2 minutes
    });
  },

  async updateProfile(profileData) {
    const result = await enhancedApiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData
    }, { enabled: false });

    // Invalidate profile cache
    apiCache.invalidate('/auth/profile');
    
    return result;
  },

  async changePassword(passwordData) {
    return await enhancedApiRequest('/auth/change-password', {
      method: 'PUT',
      body: passwordData
    }, { enabled: false });
  },

  async refreshToken() {
    return await enhancedApiRequest('/auth/refresh', {
      method: 'POST'
    }, { enabled: false });
  }
};

// Enhanced Course API
export const enhancedCourseAPI = {
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;
    
    return await enhancedApiRequest(endpoint, {}, {
      ttl: 10 * 60 * 1000 // Cache courses for 10 minutes
    });
  },

  async getCourseById(courseId) {
    return await enhancedApiRequest(`/courses/${courseId}`, {}, {
      ttl: 5 * 60 * 1000 // Cache course details for 5 minutes
    });
  },

  async createCourse(courseData) {
    return await enhancedApiRequest('/courses', {
      method: 'POST',
      body: courseData
    }, { enabled: false });
  },

  async updateCourse(courseId, courseData) {
    return await enhancedApiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: courseData
    }, { enabled: false });
  },

  async deleteCourse(courseId) {
    return await enhancedApiRequest(`/courses/${courseId}`, {
      method: 'DELETE'
    }, { enabled: false });
  },

  async enrollInCourse(courseId) {
    return await enhancedApiRequest(`/courses/${courseId}/enroll`, {
      method: 'POST'
    }, { enabled: false });
  },

  async getEnrolledCourses() {
    return await enhancedApiRequest('/enrollments/my-courses', {}, {
      ttl: 3 * 60 * 1000 // Cache enrolled courses for 3 minutes
    });
  },

  async getCourseProgress(courseId) {
    return await enhancedApiRequest(`/courses/${courseId}/progress`, {}, {
      ttl: 1 * 60 * 1000 // Cache progress for 1 minute
    });
  },

  async getCategories() {
    return await enhancedApiRequest('/categories', {}, {
      ttl: 30 * 60 * 1000 // Cache categories for 30 minutes
    });
  }
};

// API Performance Monitoring
class ApiMonitor {
  constructor() {
    this.requests = [];
    this.maxEntries = 100;
  }

  logRequest(endpoint, method, duration, success) {
    this.requests.push({
      endpoint,
      method,
      duration,
      success,
      timestamp: Date.now()
    });

    // Keep only recent requests
    if (this.requests.length > this.maxEntries) {
      this.requests = this.requests.slice(-this.maxEntries);
    }
  }

  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentRequests = this.requests.filter(req => req.timestamp > oneMinuteAgo);

    return {
      totalRequests: this.requests.length,
      recentRequests: recentRequests.length,
      averageResponseTime: this.requests.reduce((acc, req) => acc + req.duration, 0) / this.requests.length,
      successRate: (this.requests.filter(req => req.success).length / this.requests.length) * 100,
      slowestEndpoints: this.getSlowEndpoints(),
      errorRate: (this.requests.filter(req => !req.success).length / this.requests.length) * 100
    };
  }

  getSlowEndpoints() {
    const endpointStats = {};
    
    this.requests.forEach(req => {
      if (!endpointStats[req.endpoint]) {
        endpointStats[req.endpoint] = { total: 0, count: 0 };
      }
      endpointStats[req.endpoint].total += req.duration;
      endpointStats[req.endpoint].count += 1;
    });

    return Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: stats.total / stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
  }
}

// Global API monitor
const apiMonitor = new ApiMonitor();

// Export utilities
export const ApiUtils = {
  cache: apiCache,
  monitor: apiMonitor,
  TokenManager,
  clearCache: () => apiCache.clear(),
  invalidateCache: (pattern) => apiCache.invalidate(pattern),
  getStats: () => apiMonitor.getStats()
};

// Main enhanced API
export const enhancedAPI = {
  auth: enhancedAuthAPI,
  courses: enhancedCourseAPI,
  utils: ApiUtils
};

export default enhancedAPI;