export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.test.js',
    '<rootDir>/**/*.test.js'
  ],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  verbose: true,
  testTimeout: 10000
};
