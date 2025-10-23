/**
 * Performance Test Script
 * Tests bundle size, load times, and optimization metrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceTester {
  constructor() {
    this.distPath = path.join(__dirname, '..', 'dist');
    this.results = {
      bundleSize: {},
      optimization: {},
      recommendations: []
    };
  }

  // Analyze bundle sizes
  analyzeBundleSize() {
    console.log('🔍 Analyzing bundle sizes...');
    
    if (!fs.existsSync(this.distPath)) {
      console.error('❌ Build directory not found. Run npm run build first.');
      return;
    }

    const files = this.getDistFiles();
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(this.distPath, file.name);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      this.results.bundleSize[file.name] = {
        size: sizeKB + ' KB',
        type: file.type
      };
      
      totalSize += stats.size;
      
      // Check for oversized chunks
      if (stats.size > 500 * 1024) { // 500KB
        this.results.recommendations.push(
          `⚠️  Large chunk detected: ${file.name} (${sizeKB}KB) - consider code splitting`
        );
      }
    });

    this.results.bundleSize['Total'] = (totalSize / 1024).toFixed(2) + ' KB';
    
    // Bundle size recommendations
    if (totalSize > 2 * 1024 * 1024) { // 2MB
      this.results.recommendations.push(
        '🚨 Total bundle size > 2MB - implement more aggressive code splitting'
      );
    } else if (totalSize > 1 * 1024 * 1024) { // 1MB
      this.results.recommendations.push(
        '⚠️  Total bundle size > 1MB - consider lazy loading more components'
      );
    } else {
      this.results.recommendations.push(
        '✅ Bundle size is optimized (< 1MB)'
      );
    }
  }

  // Get all dist files with types
  getDistFiles() {
    const files = [];
    
    const walkDir = (dir, prefix = '') => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(prefix, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath, relativePath);
        } else {
          const ext = path.extname(item).toLowerCase();
          let type = 'other';
          
          if (['.js', '.mjs'].includes(ext)) {type = 'javascript';} else if (ext === '.css') {type = 'stylesheet';} else if (['.html'].includes(ext)) {type = 'html';} else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) {type = 'asset';}
          
          files.push({
            name: relativePath,
            type,
            size: stat.size
          });
        }
      });
    };
    
    walkDir(this.distPath);
    return files.sort((a, b) => b.size - a.size);
  }

  // Check optimization metrics
  checkOptimizations() {
    console.log('🔧 Checking optimizations...');
    
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    );

    // Check if performance packages are installed
    const devDeps = packageJson.devDependencies || {};
    
    this.results.optimization.lazyLoading = fs.existsSync(
      path.join(__dirname, '..', 'src', 'hooks', 'usePerformance.js')
    ) ? '✅ Implemented' : '❌ Missing';
    
    this.results.optimization.bundleAnalyzer = devDeps['rollup-plugin-visualizer'] 
      ? '✅ Available' : '❌ Not installed';
    
    this.results.optimization.terser = devDeps['terser'] 
      ? '✅ Available' : '❌ Not installed';
    
    // Check vite config
    const viteConfig = path.join(__dirname, '..', 'vite.config.performance.js');
    this.results.optimization.performanceConfig = fs.existsSync(viteConfig) 
      ? '✅ Available' : '❌ Missing';

    // Check for lazy imports in router
    const routerFile = path.join(__dirname, '..', 'src', 'router', 'AppRouter.jsx');
    if (fs.existsSync(routerFile)) {
      const content = fs.readFileSync(routerFile, 'utf8');
      this.results.optimization.lazyRoutes = content.includes('lazy(') 
        ? '✅ Implemented' : '❌ Missing';
    }
  }

  // Generate performance recommendations
  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    // Component-level recommendations
    const srcPath = path.join(__dirname, '..', 'src');
    
    // Check for React.memo usage
    const componentsPath = path.join(srcPath, 'components');
    if (fs.existsSync(componentsPath)) {
      const hasOptimizedComponents = this.checkForMemo(componentsPath);
      if (!hasOptimizedComponents) {
        this.results.recommendations.push(
          '🔧 Add React.memo() to frequently rendered components'
        );
      }
    }

    // Check for useCallback/useMemo usage in hooks
    const hooksPath = path.join(srcPath, 'hooks');
    if (fs.existsSync(hooksPath)) {
      const hasOptimizedHooks = this.checkForHookOptimizations(hooksPath);
      if (!hasOptimizedHooks) {
        this.results.recommendations.push(
          '🔧 Add useCallback/useMemo to expensive operations in hooks'
        );
      }
    }

    // General recommendations
    this.results.recommendations.push(
      '🚀 Consider implementing service worker for caching',
      '📱 Implement image lazy loading for better mobile performance',
      '⚡ Add preloading for critical resources',
      '🔄 Implement Progressive Web App (PWA) features'
    );
  }

  // Check if components use React.memo
  checkForMemo(dir) {
    let hasMemo = false;
    
    const walkDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('memo(') || content.includes('React.memo')) {
            hasMemo = true;
          }
        }
      });
    };
    
    walkDir(dir);
    return hasMemo;
  }

  // Check if hooks use performance optimizations
  checkForHookOptimizations(dir) {
    let hasOptimizations = false;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      if (item.endsWith('.js') || item.endsWith('.jsx')) {
        const content = fs.readFileSync(path.join(dir, item), 'utf8');
        if (content.includes('useCallback') || content.includes('useMemo')) {
          hasOptimizations = true;
        }
      }
    });
    
    return hasOptimizations;
  }

  // Print results
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE ANALYSIS RESULTS');
    console.log('='.repeat(60));
    
    // Bundle sizes
    console.log('\n📦 Bundle Sizes:');
    Object.entries(this.results.bundleSize).forEach(([file, info]) => {
      if (typeof info === 'object') {
        console.log(`  ${file}: ${info.size} (${info.type})`);
      } else {
        console.log(`  ${file}: ${info}`);
      }
    });
    
    // Optimizations
    console.log('\n🔧 Optimizations Status:');
    Object.entries(this.results.optimization).forEach(([key, status]) => {
      console.log(`  ${key}: ${status}`);
    });
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    this.results.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('Performance analysis complete! 🎉');
    
    // Save results to file
    const resultsFile = path.join(__dirname, '..', 'performance-report.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${resultsFile}`);
  }

  // Run all tests
  async run() {
    console.log('🚀 Starting performance analysis...\n');
    
    this.analyzeBundleSize();
    this.checkOptimizations();
    this.generateRecommendations();
    this.printResults();
  }
}

// Run the performance test
const tester = new PerformanceTester();
tester.run().catch(console.error);