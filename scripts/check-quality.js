#!/usr/bin/env node

/**
 * Code Quality Check Script
 * Checks for common issues in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Configuration
const config = {
  srcDir: path.join(projectRoot, 'src'),
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vite'
  ],
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  rules: {
    noConsoleLog: true,
    noWindowLocation: true,
    requireKeyProps: true,
    noHardcodedUrls: true,
    noEmptyFunctions: true,
    noTodoComments: false, // Set to true to flag TODO comments
    maxLineLength: 120,
    noInlineStyles: false
  }
};

// Issues tracking
const issues = {
  errors: [],
  warnings: [],
  info: []
};

// Utility functions
const isExcluded = (filePath) => {
  return config.excludePatterns.some(pattern => 
    filePath.includes(pattern)
  );
};

const isValidFile = (filePath) => {
  return config.fileExtensions.some(ext => 
    filePath.endsWith(ext)
  );
};

const addIssue = (type, file, line, rule, message) => {
  const issue = {
    file: path.relative(projectRoot, file),
    line,
    rule,
    message
  };
  
  issues[type].push(issue);
};

// Rule implementations
const rules = {
  checkConsoleLog: (content, filePath) => {
    if (!config.rules.noConsoleLog) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('console.log(') && !line.includes('// eslint-disable')) {
        addIssue('warnings', filePath, index + 1, 'no-console-log', 
          'Console.log found - consider using debug utility instead');
      }
    });
  },

  checkWindowLocation: (content, filePath) => {
    if (!config.rules.noWindowLocation) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('window.location.href') && !line.includes('// allow-window-location')) {
        addIssue('warnings', filePath, index + 1, 'no-window-location', 
          'Direct window.location usage found - consider using useNavigation hook');
      }
    });
  },

  checkKeyProps: (content, filePath) => {
    if (!config.rules.requireKeyProps || !filePath.includes('.jsx')) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('.map(') && !line.includes('key=')) {
        const nextFewLines = lines.slice(index, index + 3).join(' ');
        if (!nextFewLines.includes('key=')) {
          addIssue('warnings', filePath, index + 1, 'require-key-props', 
            'Map operation without key prop detected');
        }
      }
    });
  },

  checkHardcodedUrls: (content, filePath) => {
    if (!config.rules.noHardcodedUrls) {return;}
    
    const lines = content.split('\n');
    const urlRegex = /(https?:\/\/[^\s'"]+)/g;
    
    lines.forEach((line, index) => {
      const matches = line.match(urlRegex);
      if (matches && !line.includes('// hardcoded-url-ok')) {
        matches.forEach(url => {
          if (!url.includes('localhost') && !url.includes('example.com')) {
            addIssue('info', filePath, index + 1, 'no-hardcoded-urls', 
              `Hardcoded URL found: ${url} - consider using environment variables`);
          }
        });
      }
    });
  },

  checkEmptyFunctions: (content, filePath) => {
    if (!config.rules.noEmptyFunctions) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Simple check for empty functions
      if ((line.includes('() => {}') || line.includes('function() {}')) && 
          !line.includes('// empty-function-ok')) {
        addIssue('warnings', filePath, index + 1, 'no-empty-functions', 
          'Empty function found - consider adding implementation or comment');
      }
    });
  },

  checkTodoComments: (content, filePath) => {
    if (!config.rules.noTodoComments) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('todo') || line.toLowerCase().includes('fixme')) {
        addIssue('info', filePath, index + 1, 'todo-comments', 
          'TODO/FIXME comment found');
      }
    });
  },

  checkLineLength: (content, filePath) => {
    if (!config.rules.maxLineLength) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.length > config.rules.maxLineLength) {
        addIssue('warnings', filePath, index + 1, 'max-line-length', 
          `Line exceeds ${config.rules.maxLineLength} characters (${line.length})`);
      }
    });
  },

  checkInlineStyles: (content, filePath) => {
    if (!config.rules.noInlineStyles || !filePath.includes('.jsx')) {return;}
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('style={{') && !line.includes('// inline-style-ok')) {
        addIssue('info', filePath, index + 1, 'no-inline-styles', 
          'Inline style found - consider using CSS classes');
      }
    });
  }
};

// File processing
const processFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Run all rules
    Object.values(rules).forEach(rule => {
      rule(content, filePath);
    });
    
  } catch (error) {
    addIssue('errors', filePath, 0, 'file-read-error', `Error reading file: ${error.message}`);
  }
};

// Directory traversal
const processDirectory = (dirPath) => {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      
      if (isExcluded(itemPath)) {
        return;
      }
      
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (stats.isFile() && isValidFile(itemPath)) {
        processFile(itemPath);
      }
    });
    
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
};

// Report generation
const generateReport = () => {
  console.log('\n📋 Code Quality Report');
  console.log('='.repeat(50));
  
  const totalIssues = issues.errors.length + issues.warnings.length + issues.info.length;
  
  if (totalIssues === 0) {
    console.log('✅ No issues found! Code quality looks good.');
    return;
  }
  
  // Errors
  if (issues.errors.length > 0) {
    console.log(`\n❌ Errors (${issues.errors.length}):`);
    issues.errors.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.message}`);
    });
  }
  
  // Warnings
  if (issues.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${issues.warnings.length}):`);
    issues.warnings.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.message}`);
    });
  }
  
  // Info
  if (issues.info.length > 0) {
    console.log(`\n💡 Info (${issues.info.length}):`);
    issues.info.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.message}`);
    });
  }
  
  console.log(`\n📊 Summary: ${totalIssues} total issues found`);
  console.log(`   - ${issues.errors.length} errors`);
  console.log(`   - ${issues.warnings.length} warnings`);
  console.log(`   - ${issues.info.length} info`);
  
  // Exit with error code if there are errors
  if (issues.errors.length > 0) {
    process.exit(1);
  }
};

// Main execution
const main = () => {
  console.log('🔍 Running code quality checks...');
  console.log(`📁 Scanning: ${config.srcDir}`);
  
  if (!fs.existsSync(config.srcDir)) {
    console.error(`❌ Source directory not found: ${config.srcDir}`);
    process.exit(1);
  }
  
  processDirectory(config.srcDir);
  generateReport();
};

// Run the script
main();