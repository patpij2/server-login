const EmailScraper = require('./src/scrapers/EmailScraper');

/**
 * Test script to demonstrate the enhanced scraper with:
 * - Smart name extraction with context analysis
 * - AI-powered data categorization
 * - No phone number collection
 */
async function testEnhancedScraper() {
    console.log('🧪 Testing Enhanced Email Scraper with AI Categorization\n');
    
    // Test URL - using a sample business website
    const testUrl = 'https://example.com'; // Replace with a real website for testing
    
    console.log(`📋 Test Configuration:`);
    console.log(`   URL: ${testUrl}`);
    console.log(`   Smart Name Extraction: ENABLED`);
    console.log(`   AI Categorization: ENABLED`);
    console.log(`   Phone Collection: DISABLED`);
    console.log(`   Max Depth: 2`);
    console.log(`   Max Pages: 10`);
    console.log(`   Delay: 1000ms`);
    console.log('');
    
    try {
        // Create scraper with enhanced features
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
            useAICategorization: true, // Enable AI categorization
            openRouterApiKey: process.env.OPENROUTER_API_KEY, // Get from environment
            onProgress: (progress) => {
                switch (progress.type) {
                    case 'page_start':
                        console.log(`🔍 Scraping page ${progress.pagesVisited}: ${progress.url}`);
                        break;
                    case 'emails_found':
                        console.log(`   📧 Found ${progress.emails.length} emails`);
                        if (progress.personalData) {
                            console.log(`   📱 Personal data found:`, {
                                names: progress.personalData.names.length,
                                addresses: progress.personalData.addresses.length,
                                socialMedia: Object.keys(progress.personalData.socialMedia).length,
                                industries: progress.personalData.industries?.length || 0,
                                seniority: progress.personalData.seniority?.length || 0,
                                departments: progress.personalData.departments?.length || 0
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
        
        console.log('🚀 Starting enhanced scraping...\n');
        
        // Start scraping
        const result = await scraper.scrape(testUrl);
        
        console.log('\n📊 ENHANCED SCRAPING RESULTS:');
        console.log('=============================');
        console.log(`📄 Pages visited: ${result.pagesVisited}`);
        console.log(`📧 Total emails found: ${result.totalEmails}`);
        
        if (result.personalData) {
            console.log(`\n👤 ENHANCED PERSONAL DATA COLLECTED:`);
            console.log('===================================');
            
            const emails = Object.keys(result.personalData);
            console.log(`📧 Emails with personal data: ${emails.length}`);
            
            emails.forEach((email, index) => {
                const data = result.personalData[email];
                console.log(`\n${index + 1}. ${email}`);
                console.log(`   📍 Source: ${data.sourceUrl}`);
                
                if (data.names.length > 0) {
                    console.log(`   👤 Names: ${data.names.join(', ')}`);
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
                
                // AI-categorized data
                if (data.industries && data.industries.length > 0) {
                    console.log(`   🏭 Industries: ${data.industries.join(', ')}`);
                }
                
                if (data.seniority && data.seniority.length > 0) {
                    console.log(`   📈 Seniority: ${data.seniority.join(', ')}`);
                }
                
                if (data.departments && data.departments.length > 0) {
                    console.log(`   🏢 Departments: ${data.departments.join(', ')}`);
                }
                
                if (data.confidence) {
                    console.log(`   🎯 AI Confidence: ${(data.confidence * 100).toFixed(1)}%`);
                }
                
                const socialPlatforms = Object.keys(data.socialMedia);
                if (socialPlatforms.length > 0) {
                    console.log(`   🌐 Social Media:`);
                    socialPlatforms.forEach(platform => {
                        console.log(`      ${platform}: ${data.socialMedia[platform].join(', ')}`);
                    });
                }
            });
            
            // Enhanced summary statistics
            const totalNames = emails.reduce((sum, email) => sum + result.personalData[email].names.length, 0);
            const totalAddresses = emails.reduce((sum, email) => sum + result.personalData[email].addresses.length, 0);
            const totalSocialProfiles = emails.reduce((sum, email) => {
                const socialData = result.personalData[email].socialMedia;
                return sum + Object.values(socialData).reduce((acc, profiles) => acc + profiles.length, 0);
            }, 0);
            const totalIndustries = emails.reduce((sum, email) => sum + (result.personalData[email].industries?.length || 0), 0);
            const totalSeniority = emails.reduce((sum, email) => sum + (result.personalData[email].seniority?.length || 0), 0);
            const totalDepartments = emails.reduce((sum, email) => sum + (result.personalData[email].departments?.length || 0), 0);
            
            console.log(`\n📈 ENHANCED SUMMARY STATISTICS:`);
            console.log('===============================');
            console.log(`👤 Total names found: ${totalNames}`);
            console.log(`🏠 Total addresses: ${totalAddresses}`);
            console.log(`🌐 Total social media profiles: ${totalSocialProfiles}`);
            console.log(`🏭 Total industries (AI): ${totalIndustries}`);
            console.log(`📈 Total seniority levels (AI): ${totalSeniority}`);
            console.log(`🏢 Total departments (AI): ${totalDepartments}`);
        }
        
        // Close browser
        await scraper.close();
        
        console.log('\n✅ Enhanced scraper test completed successfully!');
        console.log('\n🎯 Key Improvements:');
        console.log('   • Smart name extraction with context analysis');
        console.log('   • AI-powered data categorization');
        console.log('   • No phone number collection (privacy-focused)');
        console.log('   • Enhanced job title detection');
        console.log('   • Industry and seniority inference');
        
    } catch (error) {
        console.error('\n❌ Enhanced scraper test failed:', error.message);
    }
}

// Test smart name extraction function
function testSmartNameExtraction() {
    console.log('\n🧠 Testing Smart Name Extraction\n');
    
    const testTexts = [
        'Contact John Doe at john@example.com',
        'Our CEO, Dr. Jane Smith, leads the company',
        'Team members: Mike Johnson (CTO), Sarah Wilson (Marketing Manager)',
        'About Us - John A. Doe Jr. founded this company',
        'Contact information: "Jane Smith" <jane@example.com>',
        'Our leadership team includes Mr. Robert Brown III',
        'Navigation Menu - Home Page - Contact Us', // Should be filtered out
        'Click Here to Read More About Our Services' // Should be filtered out
    ];
    
    const scraper = new EmailScraper();
    
    testTexts.forEach((text, index) => {
        console.log(`Test ${index + 1}: "${text}"`);
        const names = scraper.extractNamesFromText(text);
        console.log(`   Extracted names: ${names.length > 0 ? names.join(', ') : 'None'}`);
        console.log('');
    });
}

// Run the tests
if (require.main === module) {
    console.log('🚀 Enhanced Email Scraper Test Suite\n');
    console.log('=' .repeat(50));
    
    // Test smart name extraction first
    testSmartNameExtraction();
    
    // Then test full scraping (commented out to avoid actual scraping)
    // testEnhancedScraper();
    
    console.log('💡 To test full scraping, uncomment the testEnhancedScraper() call');
    console.log('💡 Make sure to set OPENROUTER_API_KEY environment variable for AI features');
}

module.exports = { testEnhancedScraper, testSmartNameExtraction }; 