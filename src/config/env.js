/**
 * Environment configuration
 */

// Environment detection
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

export const currentEnv = import.meta.env.MODE || ENV.DEVELOPMENT;

export const isDevelopment = currentEnv === ENV.DEVELOPMENT;
export const isProduction = currentEnv === ENV.PRODUCTION;
export const isTest = currentEnv === ENV.TEST;

// Environment-specific configurations
export const envConfig = {
  [ENV.DEVELOPMENT]: {
    API_BASE_URL: 'http://localhost:3001/api',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
    ENABLE_MOCK_DATA: false,
    CACHE_ENABLED: false
  },
  [ENV.PRODUCTION]: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.minicoursera.com/api',
    DEBUG_MODE: false,
    LOG_LEVEL: 'error',
    ENABLE_MOCK_DATA: false,
    CACHE_ENABLED: true
  },
  [ENV.TEST]: {
    API_BASE_URL: 'http://localhost:5001/api',
    DEBUG_MODE: true,
    LOG_LEVEL: 'warn',
    ENABLE_MOCK_DATA: true,
    CACHE_ENABLED: false
  }
};

// Get current environment config
export const config = envConfig[currentEnv];

// Feature flags
export const FEATURES = {
  ENABLE_ADMIN_PANEL: import.meta.env.VITE_ENABLE_ADMIN === 'true',
  ENABLE_PAYMENT: import.meta.env.VITE_ENABLE_PAYMENT === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_CHAT_SUPPORT: import.meta.env.VITE_ENABLE_CHAT === 'true'
};

// Debug utilities
export const debug = {
  log: (...args) => {
    if (config.DEBUG_MODE) {
      console.log('[DEBUG]', ...args);
    }
  },
  warn: (...args) => {
    if (config.LOG_LEVEL === 'debug' || config.LOG_LEVEL === 'warn') {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  }
};

export default {
  ENV,
  currentEnv,
  isDevelopment,
  isProduction,
  isTest,
  config,
  FEATURES,
  debug
};