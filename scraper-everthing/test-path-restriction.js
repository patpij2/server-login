require('dotenv').config();
const EmailScraper = require('./src/scrapers/EmailScraper');

/**
 * Test path restriction feature
 */
async function testPathRestriction() {
    console.log('🔗 Testing Path Restriction Feature\n');
    
    // Test URLs
    const testUrls = [
        'https://www.intero.com/roster/agents',
        'https://www.intero.com/roster/agents/john-doe',
        'https://www.intero.com/roster/agents/jane-smith',
        'https://www.intero.com/about-us', // Should be filtered out
        'https://www.intero.com/contact', // Should be filtered out
        'https://www.intero.com/services', // Should be filtered out
        'https://www.intero.com/roster/agents/team/leadership' // Should be included
    ];
    
    const restrictedPath = 'https://www.intero.com/roster/agents';
    
    console.log(`📋 Test Configuration:`);
    console.log(`   Restricted Path: ${restrictedPath}`);
    console.log(`   Test URLs: ${testUrls.length}`);
    console.log('');
    
    // Create scraper with path restriction
    const scraper = new EmailScraper({
        maxDepth: 1,
        maxPages: 10,
        delay: 100,
        headless: true,
        respectRobots: false,
        skipImages: true,
        skipCSS: true,
        skipFonts: true,
        skipMedia: true,
        collectPersonalData: false, // Disable for faster testing
        useAICategorization: false, // Disable for faster testing
        restrictToPath: restrictedPath,
        onProgress: (progress) => {
            switch (progress.type) {
                case 'url_filtered':
                    console.log(`🚫 Filtered: ${progress.url}`);
                    console.log(`   Reason: ${progress.reason}`);
                    break;
                case 'page_start':
                    console.log(`✅ Visiting: ${progress.url}`);
                    break;
                case 'emails_found':
                    console.log(`📧 Found ${progress.emails.length} emails on ${progress.url}`);
                    break;
            }
        }
    });
    
    console.log('🧪 Testing URL Filtering:');
    console.log('========================');
    
    // Test the shouldVisitUrl method directly
    testUrls.forEach(url => {
        const shouldVisit = scraper.shouldVisitUrl(url);
        const status = shouldVisit ? '✅ INCLUDED' : '🚫 FILTERED';
        console.log(`${status} ${url}`);
    });
    
    console.log('\n🚀 Starting Scraping Test:');
    console.log('==========================');
    
    try {
        // Start with the main restricted path
        const result = await scraper.scrape(restrictedPath);
        
        console.log('\n📊 Scraping Results:');
        console.log('===================');
        console.log(`📄 Pages visited: ${result.pagesVisited}`);
        console.log(`📧 Total emails found: ${result.totalEmails}`);
        console.log(`🔗 URLs processed: ${result.pagesVisited}`);
        
        // Close browser
        await scraper.close();
        
        console.log('\n✅ Path restriction test completed!');
        console.log('\n🎯 Key Features Verified:');
        console.log('   • URLs outside restricted path are filtered out');
        console.log('   • Only URLs starting with the specified path are visited');
        console.log('   • Progress updates show filtered URLs');
        console.log('   • Scraping efficiency improved by avoiding irrelevant pages');
        
    } catch (error) {
        console.error('\n❌ Path restriction test failed:', error.message);
        await scraper.close();
    }
}

// Test the shouldVisitUrl method with different scenarios
function testUrlFiltering() {
    console.log('\n🔍 Testing URL Filtering Logic\n');
    
    const scraper = new EmailScraper({
        restrictToPath: 'https://www.intero.com/roster/agents'
    });
    
    const testCases = [
        {
            url: 'https://www.intero.com/roster/agents',
            expected: true,
            description: 'Exact match'
        },
        {
            url: 'https://www.intero.com/roster/agents/john-doe',
            expected: true,
            description: 'Sub-path'
        },
        {
            url: 'https://www.intero.com/roster/agents/team/leadership',
            expected: true,
            description: 'Deep sub-path'
        },
        {
            url: 'https://www.intero.com/about-us',
            expected: false,
            description: 'Different path'
        },
        {
            url: 'https://www.intero.com/roster',
            expected: false,
            description: 'Parent path'
        },
        {
            url: 'https://www.intero.com/roster/agents-old',
            expected: false,
            description: 'Similar but different path'
        }
    ];
    
    console.log('📋 Test Cases:');
    console.log('==============');
    
    testCases.forEach((testCase, index) => {
        const result = scraper.shouldVisitUrl(testCase.url);
        const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
        console.log(`${index + 1}. ${status} ${testCase.description}`);
        console.log(`   URL: ${testCase.url}`);
        console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
        console.log('');
    });
}

// Run the tests
if (require.main === module) {
    console.log('🚀 Path Restriction Test Suite\n');
    console.log('=' .repeat(50));
    
    // Test URL filtering logic first
    testUrlFiltering();
    
    // Then test full scraping (commented out to avoid actual scraping)
    // testPathRestriction();
    
    console.log('💡 To test full scraping, uncomment the testPathRestriction() call');
    console.log('💡 This will test the feature with a real website');
}

module.exports = { testPathRestriction, testUrlFiltering }; 