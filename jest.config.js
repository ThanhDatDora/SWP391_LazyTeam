export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],
  
  // Module paths
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.test.js' }]
  },
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/test/**',
    '!src/**/*.test.{js,jsx}',
    '!src/data/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.test.{js,jsx}'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/build/',
    'example.test.js' // Vitest file, not compatible with Jest
  ],
  
  // Verbose output
  verbose: true
};
