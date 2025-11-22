// Main utilities index file
// This file exports all utility functions for easy importing

// Configuration and constants
export * from './config/constants.js';
export * from './config/env.js';

// Utilities
export * from './utils/formatters.js';
export * from './utils/storage.js';
export * from './utils/validation.js';
export * from './utils/http.js';

// Hooks
export * from './hooks/useNavigation.js';
export * from './hooks/useAsyncState.js';
export * from './hooks/useDataFetching.js';
export * from './hooks/useLocalStorage.js';

// Services
export * from './services/api.js';

// Components (UI utilities)
export * from './components/ui/loading.jsx';

// Default exports for convenience
import constants from './config/constants.js';
import env from './config/env.js';
import formatters from './utils/formatters.js';
import storage from './utils/storage.js';
import validation from './utils/validation.js';
import httpClient from './utils/http.js';
import api from './services/api.js';

export default {
  constants,
  env,
  formatters,
  storage,
  validation,
  httpClient,
  api
};