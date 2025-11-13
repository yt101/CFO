#!/usr/bin/env node

/**
 * Demo Setup Script for ReturnSight AI
 * This script helps set up demo accounts and start the development server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ReturnSight AI Demo...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please create a .env.local file with your Supabase credentials:');
  console.log(`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
`);
  console.log('\n🔗 Get your credentials from: https://supabase.com/dashboard');
  process.exit(1);
}

// Check if dependencies are installed
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

console.log('🎯 Demo Account Credentials:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('👤 Admin Account:');
console.log('   Email:    admin@demo.com');
console.log('   Password: demo123456');
console.log('');
console.log('👤 User Account:');
console.log('   Email:    user@demo.com');
console.log('   Password: demo123456');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Next Steps:');
console.log('1. Make sure your Supabase project is set up with the schema from scripts/001_create_schema.sql');
console.log('2. Create the demo accounts manually in your Supabase Auth dashboard');
console.log('3. The development server will start automatically...\n');

// Start the development server
console.log('🌐 Starting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
}

