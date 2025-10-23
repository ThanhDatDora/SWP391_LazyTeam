import { STORAGE_KEYS } from '../config/constants.js';
import { debug } from '../config/env.js';

/**
 * Safe local storage utilities with error handling and type conversion
 */

class StorageManager {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  // Check if storage is available
  isAvailable() {
    try {
      const test = '__storage_test__';
      this.storage.setItem(test, test);
      this.storage.removeItem(test);
      return true;
    } catch (e) {
      debug.warn('Storage is not available:', e);
      return false;
    }
  }

  // Set item with JSON serialization
  setItem(key, value) {
    if (!this.isAvailable()) {
      debug.warn('Storage not available, cannot set item:', key);
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
      debug.log('Storage set:', key, value);
      return true;
    } catch (error) {
      debug.error('Error setting storage item:', key, error);
      return false;
    }
  }

  // Get item with JSON deserialization
  getItem(key, defaultValue = null) {
    if (!this.isAvailable()) {
      debug.warn('Storage not available, returning default for:', key);
      return defaultValue;
    }

    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      const parsed = JSON.parse(item);
      debug.log('Storage get:', key, parsed);
      return parsed;
    } catch (error) {
      debug.error('Error getting storage item:', key, error);
      return defaultValue;
    }
  }

  // Remove item
  removeItem(key) {
    if (!this.isAvailable()) {
      debug.warn('Storage not available, cannot remove item:', key);
      return false;
    }

    try {
      this.storage.removeItem(key);
      debug.log('Storage removed:', key);
      return true;
    } catch (error) {
      debug.error('Error removing storage item:', key, error);
      return false;
    }
  }

  // Clear all items
  clear() {
    if (!this.isAvailable()) {
      debug.warn('Storage not available, cannot clear');
      return false;
    }

    try {
      this.storage.clear();
      debug.log('Storage cleared');
      return true;
    } catch (error) {
      debug.error('Error clearing storage:', error);
      return false;
    }
  }

  // Get all keys
  getAllKeys() {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      return Object.keys(this.storage);
    } catch (error) {
      debug.error('Error getting storage keys:', error);
      return [];
    }
  }

  // Get storage size in bytes (approximate)
  getSize() {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      let total = 0;
      for (const key in this.storage) {
        if (this.storage.hasOwnProperty(key)) {
          total += this.storage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      debug.error('Error calculating storage size:', error);
      return 0;
    }
  }

  // Check if key exists
  hasItem(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return this.storage.getItem(key) !== null;
    } catch (error) {
      debug.error('Error checking storage item:', key, error);
      return false;
    }
  }
}

// Create instances for localStorage and sessionStorage
export const localStorage = new StorageManager(window.localStorage);
export const sessionStorage = new StorageManager(window.sessionStorage);

// Application-specific storage helpers
export const AuthStorage = {
  setToken(token) {
    return localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  removeToken() {
    return localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  hasToken() {
    return localStorage.hasItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

export const PreferencesStorage = {
  setPreferences(preferences) {
    return localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  getPreferences() {
    return localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES, {});
  },

  updatePreference(key, value) {
    const preferences = this.getPreferences();
    preferences[key] = value;
    return this.setPreferences(preferences);
  },

  removePreferences() {
    return localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
  }
};

export const ThemeStorage = {
  setTheme(theme) {
    return localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME, 'light');
  },

  removeTheme() {
    return localStorage.removeItem(STORAGE_KEYS.THEME);
  }
};

export const LanguageStorage = {
  setLanguage(language) {
    return localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE, 'vi');
  },

  removeLanguage() {
    return localStorage.removeItem(STORAGE_KEYS.LANGUAGE);
  }
};

// Cache utilities with expiration
export const CacheStorage = {
  set(key, data, expirationInMinutes = 60) {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + expirationInMinutes);
    
    const cacheItem = {
      data,
      expiration: expiration.getTime()
    };
    
    return localStorage.setItem(`cache_${key}`, cacheItem);
  },

  get(key) {
    const cacheItem = localStorage.getItem(`cache_${key}`);
    
    if (!cacheItem) {
      return null;
    }

    const now = new Date().getTime();
    if (now > cacheItem.expiration) {
      this.remove(key);
      return null;
    }

    return cacheItem.data;
  },

  remove(key) {
    return localStorage.removeItem(`cache_${key}`);
  },

  clear() {
    const keys = localStorage.getAllKeys();
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Utility to handle storage events
export const createStorageListener = (callback) => {
  const handleStorageChange = (event) => {
    if (event.storageArea === window.localStorage) {
      callback(event);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export default {
  localStorage,
  sessionStorage,
  AuthStorage,
  PreferencesStorage,
  ThemeStorage,
  LanguageStorage,
  CacheStorage,
  createStorageListener
};