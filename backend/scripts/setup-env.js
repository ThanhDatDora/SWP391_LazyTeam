#!/usr/bin/env node
/**
 * Environment Setup Helper
 * Helps developers set up environment files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function setupBackendEnv() {
  const templatePath = path.join(__dirname, '.env.template');
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(templatePath)) {
    log('❌ .env.template not found!', 'red');
    return false;
  }

  if (fs.existsSync(envPath)) {
    log('⚠️  .env file already exists. Backing up to .env.backup', 'yellow');
    fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
  }

  // Read template
  let envContent = fs.readFileSync(templatePath, 'utf8');

  // Generate secrets
  const jwtSecret = generateSecret(64);
  const sessionSecret = generateSecret(32);
  const webhookSecret = generateSecret(32);

  // Replace placeholders
  envContent = envContent
    .replace('<GENERATE_RANDOM_SECRET>', jwtSecret)
    .replace('<ANOTHER_RANDOM_SECRET>', sessionSecret)
    .replace('<RANDOM_SECRET_FOR_WEBHOOK>', webhookSecret)
    .replace('<RANDOM_SECRET>', webhookSecret);

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  log('\n✅ Backend .env file created successfully!', 'green');
  log('\n📝 Generated secrets:', 'blue');
  log(`   - JWT_SECRET: ${jwtSecret.substring(0, 20)}...`, 'blue');
  log(`   - SESSION_SECRET: ${sessionSecret.substring(0, 20)}...`, 'blue');
  log(`   - WEBHOOK_SECRET: ${webhookSecret.substring(0, 20)}...`, 'blue');
  
  log('\n⚠️  IMPORTANT: You still need to configure:', 'yellow');
  log('   - Database credentials (DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD)', 'yellow');
  log('   - Payment gateway credentials (if using VNPay or SePay)', 'yellow');
  log('   - Email configuration (if using email features)', 'yellow');
  
  log(`\n💡 Edit backend/.env to complete setup`, 'blue');
  
  return true;
}

function setupFrontendEnv() {
  const rootDir = path.join(__dirname, '..');
  const templatePath = path.join(rootDir, '.env.template');
  const envPath = path.join(rootDir, '.env.local');

  if (!fs.existsSync(templatePath)) {
    log('❌ Frontend .env.template not found!', 'red');
    return false;
  }

  if (fs.existsSync(envPath)) {
    log('⚠️  Frontend .env.local already exists. Skipping...', 'yellow');
    return true;
  }

  // For frontend, just copy template as-is
  fs.copyFileSync(templatePath, envPath);
  
  log('✅ Frontend .env.local created successfully!', 'green');
  log('💡 Default API URL is set to http://localhost:3001/api', 'blue');
  
  return true;
}

function main() {
  log('\n🚀 Mini Coursera - Environment Setup Helper\n', 'blue');

  const args = process.argv.slice(2);
  const setupType = args[0] || 'all';

  if (setupType === 'backend' || setupType === 'all') {
    log('📦 Setting up backend environment...', 'blue');
    setupBackendEnv();
  }

  if (setupType === 'frontend' || setupType === 'all') {
    log('\n📦 Setting up frontend environment...', 'blue');
    setupFrontendEnv();
  }

  log('\n✅ Setup complete!', 'green');
  log('\n📚 Next steps:', 'blue');
  log('   1. Configure database credentials in backend/.env', 'blue');
  log('   2. Start SQL Server and create database', 'blue');
  log('   3. Run: npm install (in root and backend folders)', 'blue');
  log('   4. Run: npm run dev:full (to start both servers)', 'blue');
  log('\n');
}

main();
