require('dotenv').config();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

console.log('🧪 DIRECT FACEBOOK API TEST');
console.log('============================');

console.log('\n1️⃣ Environment Check:');
console.log('App ID:', FACEBOOK_APP_ID);
console.log('App Secret:', FACEBOOK_APP_SECRET ? '✅ Set' : '❌ Missing');

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

console.log('\n2️⃣ Facebook App Configuration:');
console.log('App ID:', FACEBOOK_APP_ID);
console.log('App Secret length:', FACEBOOK_APP_SECRET.length);

console.log('\n3️⃣ To test the Facebook API directly:');
console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
console.log('2. Select your app:', FACEBOOK_APP_ID);
console.log('3. Click "Generate Access Token"');
console.log('4. Make sure these permissions are selected:');
console.log('   - pages_read_engagement');
console.log('   - pages_show_list');
console.log('   - pages_manage_posts');
console.log('5. Copy the generated token');

console.log('\n4️⃣ Test the API endpoint:');
console.log('GET: https://graph.facebook.com/v18.0/me/accounts');
console.log('Query params:');
console.log('  - access_token: [YOUR_TOKEN]');
console.log('  - fields: id,name,category,fan_count,picture,access_token');

console.log('\n5️⃣ Expected Response:');
console.log('If working, you should see:');
console.log('{');
console.log('  "data": [');
console.log('    {');
console.log('      "id": "123456789",');
console.log('      "name": "Your Page Name",');
console.log('      "category": "Business",');
console.log('      "fan_count": 1000,');
console.log('      "picture": { "data": { "url": "..." } },');
console.log('      "access_token": "EAABwzLixnjYBO..."');
console.log('    }');
console.log('  ]');
console.log('}');

console.log('\n6️⃣ If you get empty data array:');
console.log('- Check if the user has Facebook pages');
console.log('- Verify app permissions include pages_read_engagement');
console.log('- Make sure app is not in development mode');
console.log('- Check if user has granted page permissions');

console.log('\n🎯 TEST THIS NOW:');
console.log('1. Go to Facebook Graph API Explorer');
console.log('2. Generate a token with the right permissions');
console.log('3. Test the /me/accounts endpoint');
console.log('4. Share the response with me');

console.log('\nThis will show us EXACTLY what Facebook is returning!'); 