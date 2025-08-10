require('dotenv').config();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

console.log('🧪 FACEBOOK API TEST WITH TOKEN');
console.log('================================');

console.log('\n1️⃣ Environment Check:');
console.log('App ID:', FACEBOOK_APP_ID);
console.log('App Secret:', FACEBOOK_APP_SECRET ? '✅ Set' : '❌ Missing');

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

console.log('\n2️⃣ To test with a real token:');
console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
console.log('2. Select your app:', FACEBOOK_APP_ID);
console.log('3. Generate access token with these permissions:');
console.log('   - pages_read_engagement');
console.log('   - pages_show_list');
console.log('   - pages_manage_posts');
console.log('4. Copy the token and paste it below');

console.log('\n3️⃣ Paste your access token here:');
console.log('(You can edit this file and add your token to test)');

// UNCOMMENT AND ADD YOUR TOKEN HERE TO TEST:
// const testToken = 'YOUR_ACCESS_TOKEN_HERE';

// if (testToken && testToken !== 'YOUR_ACCESS_TOKEN_HERE') {
//   console.log('\n4️⃣ Testing with your token...');
//   testFacebookAPI(testToken);
// } else {
//   console.log('\n⚠️  No valid token provided');
//   console.log('Edit this file and add your token to test');
// }

async function testFacebookAPI(accessToken) {
  try {
    console.log('\n🚀 Testing Facebook API...');
    console.log('Token preview:', accessToken.substring(0, 20) + '...');
    
    const url = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,category,fan_count,picture,access_token`;
    
    console.log('URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('\n📋 Facebook API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n❌ Facebook API Error:', data.error);
    } else if (data.data && Array.isArray(data.data)) {
      console.log(`\n✅ Success! Found ${data.data.length} pages`);
      data.data.forEach((page, index) => {
        console.log(`\n📄 Page ${index + 1}:`);
        console.log('  ID:', page.id);
        console.log('  Name:', page.name);
        console.log('  Category:', page.category);
        console.log('  Fan Count:', page.fan_count);
        console.log('  Has Access Token:', !!page.access_token);
        console.log('  Has Picture:', !!page.picture);
      });
    } else {
      console.log('\n⚠️  Unexpected response structure:', data);
    }
    
  } catch (error) {
    console.error('💥 Error testing Facebook API:', error);
  }
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Get a valid access token from Facebook Graph API Explorer');
console.log('2. Edit this file and add your token');
console.log('3. Run: node test-with-token.js');
console.log('4. Share the results with me'); 