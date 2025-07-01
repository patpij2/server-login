const EmailScraper = require('./src/scrapers/EmailScraper');

async function testPersonalDataScraping() {
    console.log('🧪 Testing Enhanced Email Scraper with Personal Data Collection\n');
    
    // Test URL - using a sample business website
    const testUrl = 'https://example.com'; // Replace with a real website for testing
    
    console.log(`📋 Test Configuration:`);
    console.log(`   URL: ${testUrl}`);
    console.log(`   Personal Data Collection: ENABLED`);
    console.log(`   Max Depth: 2`);
    console.log(`   Max Pages: 10`);
    console.log(`   Delay: 1000ms`);
    console.log('');
    
    try {
        // Create scraper with personal data collection enabled
        const scraper = new EmailScraper({
            maxDepth: 2,
            maxPages: 10,
            delay: 1000,
            headless: true,
            respectRobots: true,
            skipImages: true,
            skipCSS: true,
            skipFonts: true,
            skipMedia: true,
            collectPersonalData: true, // Enable personal data collection
            onProgress: (progress) => {
                switch (progress.type) {
                    case 'page_start':
                        console.log(`🔍 Scraping page ${progress.pagesVisited}: ${progress.url}`);
                        break;
                    case 'emails_found':
                        console.log(`   📧 Found ${progress.emails.length} emails`);
                        if (progress.personalData) {
                            console.log(`   📱 Personal data found:`, {
                                phones: progress.personalData.phones.length,
                                names: progress.personalData.names.length,
                                addresses: progress.personalData.addresses.length,
                                socialMedia: Object.keys(progress.personalData.socialMedia).length
                            });
                        }
                        break;
                    case 'page_complete':
                        console.log(`   ✅ Page completed (${progress.emailsFound} emails, ${progress.personalDataFound} data types)`);
                        break;
                    case 'page_error':
                        console.log(`   ❌ Error: ${progress.error}`);
                        break;
                }
            }
        });
        
        console.log('🚀 Starting scraping...\n');
        
        // Start scraping
        const result = await scraper.scrape(testUrl);
        
        console.log('\n📊 SCRAPING RESULTS:');
        console.log('===================');
        console.log(`📄 Pages visited: ${result.pagesVisited}`);
        console.log(`📧 Total emails found: ${result.totalEmails}`);
        
        if (result.personalData) {
            console.log(`\n👤 PERSONAL DATA COLLECTED:`);
            console.log('========================');
            
            const emails = Object.keys(result.personalData);
            console.log(`📧 Emails with personal data: ${emails.length}`);
            
            emails.forEach((email, index) => {
                const data = result.personalData[email];
                console.log(`\n${index + 1}. ${email}`);
                console.log(`   📍 Source: ${data.sourceUrl}`);
                
                if (data.names.length > 0) {
                    console.log(`   👤 Names: ${data.names.join(', ')}`);
                }
                
                if (data.phones.length > 0) {
                    console.log(`   📞 Phones: ${data.phones.join(', ')}`);
                }
                
                if (data.addresses.length > 0) {
                    console.log(`   🏠 Addresses: ${data.addresses.join(', ')}`);
                }
                
                if (data.jobTitles.length > 0) {
                    console.log(`   💼 Job Titles: ${data.jobTitles.join(', ')}`);
                }
                
                if (data.companies.length > 0) {
                    console.log(`   🏢 Companies: ${data.companies.join(', ')}`);
                }
                
                const socialPlatforms = Object.keys(data.socialMedia);
                if (socialPlatforms.length > 0) {
                    console.log(`   🌐 Social Media:`);
                    socialPlatforms.forEach(platform => {
                        console.log(`      ${platform}: ${data.socialMedia[platform].join(', ')}`);
                    });
                }
            });
            
            // Summary statistics
            const totalNames = emails.reduce((sum, email) => sum + result.personalData[email].names.length, 0);
            const totalPhones = emails.reduce((sum, email) => sum + result.personalData[email].phones.length, 0);
            const totalAddresses = emails.reduce((sum, email) => sum + result.personalData[email].addresses.length, 0);
            const totalSocialProfiles = emails.reduce((sum, email) => {
                const socialData = result.personalData[email].socialMedia;
                return sum + Object.values(socialData).reduce((acc, profiles) => acc + profiles.length, 0);
            }, 0);
            
            console.log(`\n📈 SUMMARY STATISTICS:`);
            console.log('====================');
            console.log(`👤 Total names found: ${totalNames}`);
            console.log(`📞 Total phone numbers: ${totalPhones}`);
            console.log(`🏠 Total addresses: ${totalAddresses}`);
            console.log(`🌐 Total social media profiles: ${totalSocialProfiles}`);
        }
        
        // Close browser
        await scraper.close();
        
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

// Run the test
if (require.main === module) {
    testPersonalDataScraping();
}

module.exports = { testPersonalDataScraping }; 