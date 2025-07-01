const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
    console.log('🧪 Testing Email Scraper API...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        console.log('');

        // Test API status
        console.log('2. Testing API status...');
        const statusResponse = await fetch(`${API_BASE}/api/status`);
        const statusData = await statusResponse.json();
        console.log('✅ API status:', statusData);
        console.log('');

        // Test fast scraping with a simple website
        console.log('3. Testing fast scraping...');
        const scrapeResponse = await fetch(`${API_BASE}/api/scrape/fast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: 'https://httpbin.org/html'
            })
        });
        
        if (scrapeResponse.ok) {
            const scrapeData = await scrapeResponse.json();
            console.log('✅ Fast scraping result:', {
                success: scrapeData.success,
                totalEmails: scrapeData.data.totalEmails,
                pagesVisited: scrapeData.data.pagesVisited
            });
        } else {
            console.log('❌ Scraping failed:', scrapeResponse.status, scrapeResponse.statusText);
        }
        console.log('');

        // Test standard scraping
        console.log('4. Testing standard scraping...');
        const standardResponse = await fetch(`${API_BASE}/api/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: 'https://httpbin.org/html',
                options: {
                    maxDepth: 1,
                    maxPages: 1,
                    delay: 500
                }
            })
        });
        
        if (standardResponse.ok) {
            const standardData = await standardResponse.json();
            console.log('✅ Standard scraping result:', {
                success: standardData.success,
                totalEmails: standardData.data.totalEmails,
                pagesVisited: standardData.data.pagesVisited
            });
        } else {
            console.log('❌ Standard scraping failed:', standardResponse.status, standardResponse.statusText);
        }

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run the test
testAPI(); 