import { API_CONFIG, ERROR_MESSAGES } from '../config/constants.js';
import { debug } from '../config/env.js';

/**
 * HTTP client with enhanced error handling and request/response interceptors
 */

class HttpClient {
  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    this.interceptors = {
      request: [],
      response: []
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  // Apply request interceptors
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.interceptors.request) {
      try {
        modifiedConfig = await interceptor(modifiedConfig);
      } catch (error) {
        debug.error('Request interceptor error:', error);
        throw error;
      }
    }
    
    return modifiedConfig;
  }

  // Apply response interceptors
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      try {
        modifiedResponse = await interceptor(modifiedResponse);
      } catch (error) {
        debug.error('Response interceptor error:', error);
        throw error;
      }
    }
    
    return modifiedResponse;
  }

  // Build full URL
  buildUrl(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  // Create request config
  createRequestConfig(options = {}) {
    return {
      method: 'GET',
      headers: { ...this.defaultHeaders },
      ...options,
      headers: { ...this.defaultHeaders, ...options.headers }
    };
  }

  // Handle fetch with timeout
  async fetchWithTimeout(url, config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Parse response
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  // Handle HTTP errors
  handleHttpError(response, data) {
    const error = new Error();
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;

    switch (response.status) {
      case 400:
        error.message = data.message || ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        error.message = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        error.message = ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        error.message = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
        error.message = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        error.message = data.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    return error;
  }

  // Main request method
  async request(endpoint, options = {}) {
    try {
      debug.log('HTTP Request:', endpoint, options);

      // Apply request interceptors
      const config = await this.applyRequestInterceptors(
        this.createRequestConfig(options)
      );

      // Build URL
      const url = this.buildUrl(endpoint);

      // Make request
      const response = await this.fetchWithTimeout(url, config);

      // Parse response
      const data = await this.parseResponse(response);

      debug.log('HTTP Response:', response.status, data);

      // Handle HTTP errors
      if (!response.ok) {
        throw this.handleHttpError(response, data);
      }

      // Apply response interceptors
      const finalResponse = await this.applyResponseInterceptors({
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });

      return finalResponse;

    } catch (error) {
      debug.error('HTTP Request failed:', endpoint, error);

      // Network errors
      if (!navigator.onLine) {
        error.message = ERROR_MESSAGES.NETWORK_ERROR;
      } else if (error.message === 'Request timeout') {
        error.message = 'Kết nối quá chậm. Vui lòng thử lại.';
      } else if (error.message === 'Failed to fetch') {
        error.message = ERROR_MESSAGES.NETWORK_ERROR;
      }

      throw error;
    }
  }

  // HTTP method shortcuts
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(this.buildUrl(endpoint));
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    return this.request(url.pathname + url.search, {
      method: 'GET',
      ...options
    });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  // Upload file
  async upload(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional form fields
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...options.headers
      }
    });
  }

  // Download file
  async download(endpoint, filename, options = {}) {
    try {
      const response = await this.request(endpoint, {
        ...options,
        headers: {
          ...options.headers
        }
      });

      // Create blob from response
      const blob = new Blob([response.data]);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      debug.error('Download failed:', error);
      throw error;
    }
  }
}

// Create default instance
const httpClient = new HttpClient();

// Add default request interceptor for auth token
httpClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add default response interceptor for auth errors
httpClient.addResponseInterceptor((response) => {
  if (response.status === 401) {
    // Remove invalid token
    localStorage.removeItem('authToken');
    
    // Redirect to login (you might want to use your navigation utility here)
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth';
    }
  }
  
  return response;
});

// Retry utility for failed requests
export const withRetry = async (requestFn, maxRetries = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 408 (timeout)
      if (error.status >= 400 && error.status < 500 && error.status !== 408) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      debug.log(`Retrying request (attempt ${attempt + 1}/${maxRetries})`);
    }
  }
  
  throw lastError;
};

// Batch requests utility
export const batchRequests = async (requests, options = {}) => {
  const { concurrency = 5, failFast = false } = options;
  const results = [];
  const errors = [];

  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = await request();
        return { success: true, data: result, index: i + index };
      } catch (error) {
        const errorResult = { success: false, error, index: i + index };
        
        if (failFast) {
          throw error;
        }
        
        return errorResult;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(result => {
      if (result.success) {
        results[result.index] = result.data;
      } else {
        errors[result.index] = result.error;
      }
    });
  }

  return { results, errors };
};

export { HttpClient };
export default httpClient;