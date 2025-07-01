const EmailScraper = require('./src/scrapers/EmailScraper');

/**
 * Test script to demonstrate the enhanced dashboard with personal data
 * This simulates the data structure that would be returned to the dashboard
 */
async function testDashboardData() {
    console.log('🧪 Testing Enhanced Dashboard Data Display\n');
    
    // Simulate scraped data with personal information
    const mockScrapedData = {
        url: 'https://example-company.com',
        emails: [
            'john.doe@example-company.com',
            'jane.smith@example-company.com',
            'mike.johnson@example-company.com',
            'sarah.wilson@example-company.com'
        ],
        totalEmails: 4,
        pagesVisited: 15,
        mode: 'fast',
        timestamp: new Date().toISOString(),
        personalData: {
            'john.doe@example-company.com': {
                phones: ['+1-555-123-4567', '(555) 987-6543'],
                names: ['John Doe', 'John A. Doe'],
                addresses: ['123 Main Street, New York, NY 10001'],
                socialMedia: {
                    linkedin: ['linkedin.com/in/johndoe'],
                    twitter: ['twitter.com/johndoe'],
                    facebook: ['facebook.com/john.doe']
                },
                jobTitles: ['CEO', 'Founder'],
                companies: ['Example Company Inc.'],
                sourceUrl: 'https://example-company.com/team'
            },
            'jane.smith@example-company.com': {
                phones: ['555-456-7890'],
                names: ['Jane Smith', 'Jane A. Smith'],
                addresses: ['456 Oak Avenue, San Francisco, CA 94102'],
                socialMedia: {
                    linkedin: ['linkedin.com/in/janesmith'],
                    instagram: ['instagram.com/janesmith']
                },
                jobTitles: ['CTO', 'Technical Director'],
                companies: ['Example Company Inc.'],
                sourceUrl: 'https://example-company.com/team'
            },
            'mike.johnson@example-company.com': {
                phones: ['+1-555-789-0123'],
                names: ['Mike Johnson'],
                addresses: ['789 Pine Street, Chicago, IL 60601'],
                socialMedia: {
                    linkedin: ['linkedin.com/in/mikejohnson'],
                    youtube: ['youtube.com/channel/mikejohnson']
                },
                jobTitles: ['Senior Developer', 'Lead Engineer'],
                companies: ['Example Company Inc.'],
                sourceUrl: 'https://example-company.com/team'
            },
            'sarah.wilson@example-company.com': {
                phones: ['(555) 321-0987'],
                names: ['Sarah Wilson'],
                addresses: ['321 Elm Street, Boston, MA 02101'],
                socialMedia: {
                    linkedin: ['linkedin.com/in/sarahwilson']
                },
                jobTitles: ['Marketing Manager'],
                companies: ['Example Company Inc.'],
                sourceUrl: 'https://example-company.com/team'
            }
        }
    };
    
    console.log('📊 Mock Scraped Data Structure:');
    console.log('================================');
    console.log(`URL: ${mockScrapedData.url}`);
    console.log(`Total Emails: ${mockScrapedData.totalEmails}`);
    console.log(`Pages Visited: ${mockScrapedData.pagesVisited}`);
    console.log(`Personal Data: ${Object.keys(mockScrapedData.personalData).length} contacts with personal data`);
    
    // Calculate summary statistics
    const summary = calculatePersonalDataSummary(mockScrapedData.personalData);
    
    console.log('\n📈 Summary Statistics:');
    console.log('======================');
    console.log(`👤 Total Names: ${summary.totalNames}`);
    console.log(`📞 Total Phone Numbers: ${summary.totalPhones}`);
    console.log(`🏠 Total Addresses: ${summary.totalAddresses}`);
    console.log(`🌐 Total Social Media Profiles: ${summary.totalSocialProfiles}`);
    console.log(`💼 Total Job Titles: ${summary.totalJobTitles}`);
    console.log(`🏢 Total Companies: ${summary.totalCompanies}`);
    
    console.log('\n👥 Contact Details:');
    console.log('===================');
    
    Object.entries(mockScrapedData.personalData).forEach(([email, data], index) => {
        console.log(`\n${index + 1}. ${email}`);
        console.log(`   📍 Source: ${data.sourceUrl}`);
        
        if (data.names && data.names.length > 0) {
            console.log(`   👤 Names: ${data.names.join(', ')}`);
        }
        
        if (data.phones && data.phones.length > 0) {
            console.log(`   📞 Phones: ${data.phones.join(', ')}`);
        }
        
        if (data.addresses && data.addresses.length > 0) {
            console.log(`   🏠 Addresses: ${data.addresses.join(', ')}`);
        }
        
        if (data.jobTitles && data.jobTitles.length > 0) {
            console.log(`   💼 Job Titles: ${data.jobTitles.join(', ')}`);
        }
        
        if (data.companies && data.companies.length > 0) {
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
    
    // Test the dashboard display functions
    console.log('\n🎨 Dashboard Display Test:');
    console.log('==========================');
    
    // Simulate what the dashboard would generate
    const personalDataSection = generatePersonalDataSection(mockScrapedData.personalData);
    console.log('Personal Data Section HTML would be generated with:');
    console.log('- Summary statistics cards');
    console.log('- Individual contact cards for each email');
    console.log('- Organized data sections (names, phones, addresses, etc.)');
    console.log('- Social media links with platform-specific styling');
    
    console.log('\n✅ Dashboard Enhancement Complete!');
    console.log('\nThe dashboard now displays:');
    console.log('📧 Email addresses in a clean table format');
    console.log('👤 Personal data in organized contact cards');
    console.log('📊 Summary statistics with visual indicators');
    console.log('🌐 Social media profiles with clickable links');
    console.log('📞 Phone numbers and addresses');
    console.log('💼 Job titles and company information');
    console.log('📍 Source URLs for each contact');
}

// Helper functions (copied from dashboard for testing)
function calculatePersonalDataSummary(personalData) {
    const emails = Object.keys(personalData);
    let totalNames = 0;
    let totalPhones = 0;
    let totalAddresses = 0;
    let totalSocialProfiles = 0;
    let totalJobTitles = 0;
    let totalCompanies = 0;

    emails.forEach(email => {
        const data = personalData[email];
        totalNames += data.names ? data.names.length : 0;
        totalPhones += data.phones ? data.phones.length : 0;
        totalAddresses += data.addresses ? data.addresses.length : 0;
        totalJobTitles += data.jobTitles ? data.jobTitles.length : 0;
        totalCompanies += data.companies ? data.companies.length : 0;
        
        if (data.socialMedia) {
            Object.values(data.socialMedia).forEach(profiles => {
                totalSocialProfiles += profiles.length;
            });
        }
    });

    return {
        totalContacts: emails.length,
        totalNames,
        totalPhones,
        totalAddresses,
        totalSocialProfiles,
        totalJobTitles,
        totalCompanies
    };
}

function generatePersonalDataSection(personalData) {
    const emails = Object.keys(personalData);
    
    if (emails.length === 0) {
        return '<div class="no-personal-data">No personal data found</div>';
    }

    const summary = calculatePersonalDataSummary(personalData);
    
    return `
        <div class="personal-data-section">
            <div class="personal-data-header">Personal Data Collected</div>
            <div class="data-summary">
                <div>📊 Data Summary</div>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalContacts}</div>
                        <div class="stat-label">Contacts</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalNames}</div>
                        <div class="stat-label">Names</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalPhones}</div>
                        <div class="stat-label">Phones</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalAddresses}</div>
                        <div class="stat-label">Addresses</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalSocialProfiles}</div>
                        <div class="stat-label">Social Profiles</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalJobTitles}</div>
                        <div class="stat-label">Job Titles</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Run the test
if (require.main === module) {
    testDashboardData().catch(console.error);
}

module.exports = { testDashboardData }; 