#!/usr/bin/env node

/**
 * Fix Navigation Script
 * Automatically replaces window.location.href with useNavigation hook
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Files that need navigation fixes
const filesToFix = [
  'src/components/layout/Footer.jsx',
  'src/components/layout/GuestHeader.jsx',
  'src/components/layout/Header.jsx',
  'src/pages/CatalogPage.jsx',
  'src/pages/Checkout.jsx',
  'src/pages/course/CoursePage.jsx',
  'src/pages/exam/ExamHistoryPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/instructor/CourseManagement.jsx',
  'src/pages/instructor/InstructorDashboard.jsx',
  'src/pages/Landing.jsx',
  'src/pages/Pricing.jsx',
  'src/pages/ProgressPage.jsx'
];

// Navigation patterns and their replacements
const navigationPatterns = [
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/auth['"`]/g,
    replacement: 'navigate("/auth")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/['"`]/g,
    replacement: 'navigate("/")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/catalog['"`]/g,
    replacement: 'navigate("/catalog")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/course\/\$\{([^}]+)\}['"`]/g,
    replacement: 'navigate(`/course/${$1}`)'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/exam\/\$\{([^}]+)\}['"`]/g,
    replacement: 'navigate(`/exam/${$1}`)'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/progress['"`]/g,
    replacement: 'navigate("/progress")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/instructor['"`]/g,
    replacement: 'navigate("/instructor")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/admin['"`]/g,
    replacement: 'navigate("/admin")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/pricing['"`]/g,
    replacement: 'navigate("/pricing")'
  },
  {
    pattern: /window\.location\.href\s*=\s*['"`]\/exam-history['"`]/g,
    replacement: 'navigate("/exam-history")'
  },
  {
    pattern: /window\.location\.href\s*=\s*`([^`]+)`/g,
    replacement: 'navigate(`$1`)'
  },
  {
    pattern: /window\.location\.href\s*=\s*"([^"]+)"/g,
    replacement: 'navigate("$1")'
  },
  {
    pattern: /window\.location\.href\s*=\s*'([^']+)'/g,
    replacement: "navigate('$1')"
  }
];

// Check if file needs useNavigation import
const needsNavigationImport = (content) => {
  return content.includes('navigate(') && !content.includes('useNavigation');
};

// Add useNavigation import
const addNavigationImport = (content) => {
  const lines = content.split('\n');
  let importAdded = false;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('import') && lines[i].includes('from')) {
      // Check if this is the last import
      let isLastImport = true;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === '') {continue;}
        if (lines[j].includes('import') && lines[j].includes('from')) {
          isLastImport = false;
          break;
        }
        break;
      }
      
      if (isLastImport && !importAdded) {
        lines.splice(i + 1, 0, "import { useNavigation } from '../../hooks/useNavigation.js';");
        importAdded = true;
        break;
      }
    }
  }
  
  // If no imports found, add at the top
  if (!importAdded) {
    lines.unshift("import { useNavigation } from '../../hooks/useNavigation.js';");
  }
  
  return lines.join('\n');
};

// Add navigation hook to component
const addNavigationHook = (content) => {
  // Find function component declaration
  const functionPattern = /export default function\s+\w+\s*\([^)]*\)\s*\{/;
  const arrowPattern = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/;
  
  let match = content.match(functionPattern);
  if (!match) {
    match = content.match(arrowPattern);
  }
  
  if (match) {
    const hookDeclaration = '  const navigate = useNavigation();';
    const insertIndex = match.index + match[0].length;
    
    // Check if hook already exists
    if (!content.includes('const navigate = useNavigation()')) {
      const before = content.slice(0, insertIndex);
      const after = content.slice(insertIndex);
      return before + '\n' + hookDeclaration + after;
    }
  }
  
  return content;
};

// Process a single file
const processFile = (filePath) => {
  try {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply navigation patterns
    navigationPatterns.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      if (content !== originalContent) {
        modified = true;
        console.log(`  - Applied pattern: ${pattern.source}`);
      }
    });
    
    if (modified) {
      // Add navigation import if needed
      if (needsNavigationImport(content)) {
        content = addNavigationImport(content);
        console.log('  - Added useNavigation import');
      }
      
      // Add navigation hook if needed
      if (content.includes('navigate(') && !content.includes('const navigate = useNavigation()')) {
        content = addNavigationHook(content);
        console.log('  - Added navigation hook');
      }
      
      // Write back to file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Updated: ${filePath}`);
    } else {
      console.log(`  ⏭️  No changes needed: ${filePath}`);
    }
    
    return modified;
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
const main = () => {
  console.log('🔧 Fixing navigation patterns...\n');
  
  let totalModified = 0;
  
  filesToFix.forEach(relativePath => {
    const fullPath = path.join(projectRoot, relativePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${relativePath}`);
      return;
    }
    
    const wasModified = processFile(fullPath);
    if (wasModified) {
      totalModified++;
    }
    
    console.log(''); // Empty line between files
  });
  
  console.log('\n🎉 Fix Navigation Complete!');
  console.log(`📊 Summary: ${totalModified} files modified out of ${filesToFix.length} total`);
  
  if (totalModified > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes in your editor');
    console.log('2. Test the navigation in your app');
    console.log('3. Run: npm run check-quality to verify fixes');
  }
};

// Run the script
main();