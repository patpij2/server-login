#!/usr/bin/env node

// Simple CLI to inspect raw Facebook responses
// Usage:
//   node backend/scripts/facebook-debug.js --token <USER_ACCESS_TOKEN> [--version v18.0]

require('dotenv').config();

const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    const val = args[i + 1];
    if (key === '--token') out.token = val;
    if (key === '--version') out.version = val;
  }
  return out;
}

(async () => {
  try {
    const { token, version = process.env.FACEBOOK_API_VERSION || 'v18.0' } = parseArgs();
    if (!token) {
      console.error('Missing --token <USER_ACCESS_TOKEN>');
      process.exit(1);
    }

    console.log('🔎 Facebook Debug Inspector');
    console.log('API Version:', version);

    const accountsUrl = `https://graph.facebook.com/${version}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(token)}`;
    console.log('\n➡️  GET', accountsUrl.replace(token, '[REDACTED]'));
    const accounts = await fetchJson(accountsUrl);
    console.log('Status:', accounts.status);
    console.log('Response:', JSON.stringify(accounts.body, null, 2));

    if (accounts.body && Array.isArray(accounts.body.data)) {
      for (const acct of accounts.body.data) {
        const pageId = acct.id;
        const pageToken = acct.access_token;
        const pageUrl = `https://graph.facebook.com/${version}/${pageId}?fields=id,name,category,fan_count,picture{url}&access_token=${encodeURIComponent(pageToken)}`;
        console.log(`\n➡️  GET ${pageUrl.replace(pageToken, '[REDACTED]')} (page ${pageId})`);
        const page = await fetchJson(pageUrl);
        console.log('Status:', page.status);
        console.log('Response:', JSON.stringify(page.body, null, 2));
      }
    }

    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})(); 