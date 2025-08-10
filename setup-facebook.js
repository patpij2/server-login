#!/usr/bin/env node

/**
 * 🚀 Facebook Integration Setup Script
 * 
 * This script helps you set up Facebook API integration by:
 * 1. Checking environment variables
 * 2. Validating Facebook app configuration
 * 3. Testing the connection
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📘 Facebook Integration Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ No .env file found in backend directory');
  console.log('📝 Please create a .env file with the following variables:');
  console.log('');
  console.log('FACEBOOK_APP_ID=your_facebook_app_id_here');
  console.log('FACEBOOK_APP_SECRET=your_facebook_app_secret_here');
  console.log('FACEBOOK_REDIRECT_URI=http://localhost:3000/facebook-callback.html');
  console.log('FACEBOOK_API_VERSION=v18.0');
  console.log('');
  process.exit(1);
}

// Read and parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Check required Facebook variables
const requiredVars = [
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'FACEBOOK_REDIRECT_URI',
  'FACEBOOK_API_VERSION'
];

const missingVars = requiredVars.filter(varName => !envVars[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('');
  console.log('📝 Please add these to your .env file and run this script again.');
  process.exit(1);
}

console.log('✅ Environment variables found:');
requiredVars.forEach(varName => {
  const value = envVars[varName];
  const displayValue = varName.includes('SECRET') ? '***' + value.slice(-4) : value;
  console.log(`   ${varName}: ${displayValue}`);
});

console.log('\n🔍 Checking Facebook app configuration...');

// Validate Facebook App ID format (should be numeric)
if (!/^\d+$/.test(envVars.FACEBOOK_APP_ID)) {
  console.log('⚠️  Warning: Facebook App ID should be numeric');
}

// Validate redirect URI
if (!envVars.FACEBOOK_REDIRECT_URI.includes('localhost') && !envVars.FACEBOOK_REDIRECT_URI.includes('https://')) {
  console.log('⚠️  Warning: Redirect URI should use HTTPS in production');
}

console.log('\n📋 Next steps:');
console.log('');
console.log('1. Go to https://developers.facebook.com');
console.log('2. Create a new app or select your existing app');
console.log('3. Add "Facebook Login" product to your app');
console.log('4. Configure OAuth redirect URIs:');
console.log(`   ${envVars.FACEBOOK_REDIRECT_URI}`);
console.log('5. Set app domain to: localhost (for development)');
console.log('6. Add required permissions:');
console.log('   - pages_show_list');
console.log('');

// Ask if user wants to test the connection
rl.question('🧪 Would you like to test the Facebook connection? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🚀 Starting test...');
    testFacebookConnection();
  } else {
    console.log('\n✅ Setup complete! You can now:');
    console.log('1. Start your backend: cd backend && npm run dev');
    console.log('2. Start your frontend: cd frontend && serve . -l 3000');
    console.log('3. Navigate to http://localhost:3000/facebook-setup.html');
    console.log('4. Test the Facebook integration');
    rl.close();
  }
});

async function testFacebookConnection() {
  try {
    // Check if backend is running
    const response = await fetch('http://localhost:8000/api/health');
    if (response.ok) {
      console.log('✅ Backend is running');
      
      // Test Facebook auth URL generation
      const authResponse = await fetch('http://localhost:8000/api/facebook/auth/url');
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ Facebook auth URL generation working');
        console.log(`   Auth URL: ${authData.data.authUrl}`);
      } else {
        console.log('❌ Facebook auth URL generation failed');
        console.log('   Check your backend logs for errors');
      }
    } else {
      console.log('❌ Backend is not running');
      console.log('   Please start your backend first: cd backend && npm run dev');
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    console.log('   Make sure your backend is running on port 8000');
  }
  
  console.log('\n✅ Setup complete! You can now:');
  console.log('1. Start your backend: cd backend && npm run dev');
  console.log('2. Start your frontend: cd frontend && serve . -l 3000');
  console.log('3. Navigate to http://localhost:3000/facebook-setup.html');
  console.log('4. Test the Facebook integration');
  
  rl.close();
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled. Goodbye!');
  process.exit(0);
}); 