/**
 * Test utilities for React component testing
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Custom render function that includes providers
export const renderWithRouter = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  role_id: 3,
  role_name: 'learner',
  created_at: new Date().toISOString(),
  ...overrides
});

export const createMockCourse = (overrides = {}) => ({
  id: 1,
  title: 'Test Course',
  description: 'This is a test course',
  price: 99.99,
  level: 'Beginner',
  category: 'Technology',
  instructor: 'Test Instructor',
  duration: '4 weeks',
  rating: 4.5,
  learners: 150,
  ...overrides
});

export const createMockEnrollment = (overrides = {}) => ({
  id: 1,
  course_id: 1,
  user_id: 1,
  enrolled_at: new Date().toISOString(),
  progress: 25,
  status: 'active',
  ...overrides
});

// API mock helpers
export const mockApiResponse = (data, success = true) => ({
  success,
  data,
  ...(success ? {} : { error: 'Mock error message' })
});

export const mockApiCall = (returnValue) => {
  return vi.fn().mockResolvedValue(mockApiResponse(returnValue));
};

export const mockApiError = (error = 'API Error') => {
  return vi.fn().mockResolvedValue(mockApiResponse(null, false));
};

// Authentication context mock
export const createMockAuthContext = (user = null, isAuthenticated = false) => ({
  state: {
    user,
    isAuthenticated,
    isLoading: false
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn()
});

// Local storage helpers
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// Wait for element helpers
export const waitForElementToBeRemoved = async (element) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
};

export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

// Form testing helpers
export const fillForm = async (user, formData) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = screen.getByLabelText(new RegExp(field, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
};

export const submitForm = async (user, buttonText = /submit|save|create/i) => {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
};

// Navigation helpers
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null
};

// Console mock helpers
export const mockConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  beforeEach(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });
};

// Async testing helpers
export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

// Component testing utilities
export const getByTextContent = (text) => {
  return screen.getByText((content, element) => {
    return element?.textContent === text;
  });
};

export const queryByTextContent = (text) => {
  return screen.queryByText((content, element) => {
    return element?.textContent === text;
  });
};

// Error boundary testing
export const ErrorBoundaryFallback = ({ error }) => (
  <div role="alert">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
  </div>
);

// Custom matchers
export const customMatchers = {
  toBeLoading: (element) => {
    const pass = element && (
      element.classList.contains('loading') ||
      element.getAttribute('aria-busy') === 'true' ||
      element.querySelector('[role="progressbar"]') !== null
    );
    
    return {
      pass,
      message: () => `Expected element to ${pass ? 'not ' : ''}be in loading state`
    };
  },
  
  toHaveErrorMessage: (element, expectedError) => {
    const errorElement = element.querySelector('[role="alert"], .error-message');
    const pass = errorElement && errorElement.textContent.includes(expectedError);
    
    return {
      pass,
      message: () => `Expected element to ${pass ? 'not ' : ''}have error message: ${expectedError}`
    };
  }
};

// Test data generators
export const generateCourseList = (count = 5) => {
  return Array.from({ length: count }, (_, index) => 
    createMockCourse({ 
      id: index + 1, 
      title: `Course ${index + 1}`,
      price: 50 + (index * 25)
    })
  );
};

export const generateUserList = (count = 5) => {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({ 
      id: index + 1, 
      email: `user${index + 1}@example.com`,
      full_name: `User ${index + 1}`
    })
  );
};

// Performance testing helpers
export const measureRenderTime = (renderFn) => {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  return {
    ...result,
    renderTime: end - start
  };
};

export default {
  renderWithRouter,
  createMockUser,
  createMockCourse,
  createMockEnrollment,
  mockApiResponse,
  mockApiCall,
  mockApiError,
  createMockAuthContext,
  mockLocalStorage,
  waitForLoadingToFinish,
  fillForm,
  submitForm,
  flushPromises,
  customMatchers,
  generateCourseList,
  generateUserList
};