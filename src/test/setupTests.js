import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock toast notifications - CartContext destructures: const { toast } = useToast()
// But actual Toast.jsx returns: const toast = useToast(); toast.success()
// We mock both patterns for compatibility
jest.mock('../components/ui/Toast', () => ({
  useToast: () => {
    const mockMethods = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      loading: jest.fn(),
    };
    // Return methods directly AND as nested 'toast' object for backwards compat
    return {
      ...mockMethods,
      toast: mockMethods
    };
  }
}));
