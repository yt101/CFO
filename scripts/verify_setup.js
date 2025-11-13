#!/usr/bin/env node

/**
 * Setup Verification Script for ReturnSight AI
 * This script helps verify that everything is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying ReturnSight AI Setup...\n');

// Check if .env.local exists and has valid values
const envPath = path.join(process.cwd(), '.env.local');
let envValid = false;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let hasUrl = false;
  let hasKey = false;
  
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=') && !line.includes('your_supabase_url_here')) {
      hasUrl = true;
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !line.includes('your_supabase_anon_key_here')) {
      hasKey = true;
    }
  });
  
  if (hasUrl && hasKey) {
    envValid = true;
    console.log('✅ Environment variables are configured');
  } else {
    console.log('❌ Environment variables need to be configured');
    console.log('   Missing or using placeholder values for:');
    if (!hasUrl) console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    if (!hasKey) console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
} else {
  console.log('❌ .env.local file not found');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies are installed');
} else {
  console.log('❌ Dependencies not installed - run "npm install"');
}

// Check if server is running
const { execSync } = require('child_process');
try {
  const result = execSync('netstat -an | findstr :3000', { encoding: 'utf8' });
  if (result.includes('LISTENING')) {
    console.log('✅ Development server is running on port 3000');
  } else {
    console.log('❌ Development server is not running');
  }
} catch (error) {
  console.log('❌ Development server is not running');
}

console.log('\n📋 Setup Checklist:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('□ Get Supabase credentials from https://supabase.com/dashboard');
console.log('□ Update .env.local with real credentials');
console.log('□ Run database schema in Supabase SQL Editor');
console.log('□ Create demo accounts in Supabase Auth dashboard');
console.log('□ Access http://localhost:3000 in your browser');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (envValid) {
  console.log('🎉 Setup looks good! You can now:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Create demo accounts in Supabase Auth dashboard');
  console.log('3. Login with demo credentials:');
  console.log('   • admin@demo.com / demo123456');
  console.log('   • user@demo.com / demo123456');
} else {
  console.log('🔧 Next steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Create a new project or select existing one');
  console.log('3. Go to Settings → API');
  console.log('4. Copy Project URL and anon/public key');
  console.log('5. Update .env.local with these values');
  console.log('6. Run this script again to verify');
}

console.log('\n📚 For detailed instructions, see DEMO_SETUP.md');

