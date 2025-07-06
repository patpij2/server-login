const fetch = require('node-fetch');

// Test the batch scraping endpoint with multiple URLs
async function testBatchScraping() {
    const testUrls = [
        'https://example.com',
        'https://httpbin.org',
        'https://jsonplaceholder.typicode.com'
    ];

    console.log('🧪 Testing batch scraping with multiple URLs...');
    console.log('URLs to test:', testUrls);

    try {
        const response = await fetch('http://localhost:3001/api/scrape/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                urls: testUrls,
                options: {
                    collectPersonalData: true,
                    useAICategorization: false, // Disable AI for faster testing
                    maxPages: 5, // Limit pages for faster testing
                    maxDepth: 1
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Batch scraping test successful!');
            console.log('📊 Results:');
            console.log(`  - Total URLs: ${data.data.totalUrls}`);
            console.log(`  - Successful: ${data.data.successfulUrls}`);
            console.log(`  - Failed: ${data.data.failedUrls}`);
            console.log(`  - Total Emails: ${data.data.totalEmails}`);
            
            console.log('\n📋 Individual Results:');
            data.data.results.forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.url}: ${result.success ? '✅' : '❌'} ${result.success ? `${result.totalEmails} emails` : result.error}`);
            });
        } else {
            console.log('❌ Batch scraping test failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Error testing batch scraping:', error.message);
    }
}

// Test the scraper status endpoint
async function testScraperStatus() {
    try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        
        console.log('🔍 Scraper Status:');
        console.log(`  - Status: ${data.status}`);
        console.log(`  - Version: ${data.version}`);
        console.log(`  - Available endpoints: ${Object.keys(data.endpoints).length}`);
    } catch (error) {
        console.error('❌ Error checking scraper status:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting multi-URL scraper tests...\n');
    
    await testScraperStatus();
    console.log('');
    
    await testBatchScraping();
    
    console.log('\n✨ Tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testBatchScraping, testScraperStatus }; 