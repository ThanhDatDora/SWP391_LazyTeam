import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    reporter: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'backend/**/*.{js,ts}'
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        'testing/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/*.config.ts',
        'dist/',
        'build/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__tests__/**'
      ],
      // Thresholds để đảm bảo chất lượng
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});