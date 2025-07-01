#!/usr/bin/env node

/**
 * Gmail Integration Setup Helper
 * This script helps you configure the Google Cloud Console for Gmail OAuth2
 */

console.log('📧 Gmail Integration Setup Helper\n');

console.log('🔧 To fix the redirect_uri_mismatch error, follow these steps:\n');

console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('2. Select your project');
console.log('3. Go to "APIs & Services" > "Credentials"');
console.log('4. Find your OAuth 2.0 Client ID and click on it');
console.log('5. In the "Authorized redirect URIs" section, make sure you have EXACTLY:');
console.log('   http://localhost:3000/gmail-callback.html');
console.log('6. Click "Save"\n');

console.log('⚠️  Important Notes:');
console.log('- The redirect URI must match EXACTLY (including http:// and no trailing slash)');
console.log('- Make sure your frontend is running on http://localhost:3000');
console.log('- The gmail-callback.html file must be accessible at that URL\n');

console.log('🚀 After updating the redirect URI:');
console.log('1. Restart your backend server');
console.log('2. Try connecting Gmail again from the dashboard\n');

console.log('📋 Current Configuration:');
console.log('- Redirect URI: http://localhost:3000/gmail-callback.html');
console.log('- Frontend URL: http://localhost:3000');
console.log('- Backend URL: http://localhost:8000\n');

console.log('🔍 To test if your frontend is accessible:');
console.log('Open: http://localhost:3000/gmail-callback.html');
console.log('You should see a page with "Processing Gmail authorization..."\n');

console.log('📞 If you still have issues:');
console.log('1. Check the browser console for errors');
console.log('2. Check the backend logs for errors');
console.log('3. Verify your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct');
console.log('4. Make sure the Gmail API is enabled in your Google Cloud project\n'); 