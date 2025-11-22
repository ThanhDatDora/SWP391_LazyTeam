import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  // Performance optimizations
  build: {
    // Enable source maps for production debugging
    sourcemap: false,
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
          
          // Feature chunks
          'admin': [
            './src/pages/admin/AdminPanel.jsx'
          ],
          'instructor': [
            './src/pages/instructor/InstructorDashboard.jsx',
            './src/pages/instructor/CourseManagement.jsx'
          ],
          'learner': [
            './src/pages/learner/LearnerDashboard.jsx',
            './src/pages/MyCoursesPage.jsx',
            './src/pages/CoursePlayerPage.jsx'
          ]
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Development optimizations
  server: {
    // Enable HMR
    hmr: true,
    
    // Port configuration
    port: 5173,
    host: true,
    
    // Proxy for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
});