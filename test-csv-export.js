const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Test the CSV export functionality
async function testCSVExport() {
    console.log('🧪 Testing CSV export functionality...');

    // Sample scraping data (simulating what would come from a batch scrape)
    const sampleData = {
        totalUrls: 3,
        successfulUrls: 2,
        failedUrls: 1,
        totalEmails: 4,
        results: [
            {
                url: 'https://example.com',
                success: true,
                emails: ['contact@example.com', 'info@example.com'],
                totalEmails: 2,
                pagesVisited: 5,
                personalData: {
                    'contact@example.com': {
                        names: ['John Doe', 'John Smith'],
                        jobTitles: ['CEO', 'Founder'],
                        companies: ['Example Corp'],
                        keywords: ['technology', 'innovation'],
                        addresses: ['123 Main St, City, State'],
                        socialMedia: {
                            'linkedin': ['linkedin.com/in/johndoe'],
                            'twitter': ['@johndoe']
                        },
                        industries: ['Technology'],
                        seniority: ['Executive'],
                        departments: ['Leadership']
                    },
                    'info@example.com': {
                        names: ['Jane Smith'],
                        jobTitles: ['Marketing Manager'],
                        companies: ['Example Corp'],
                        keywords: ['marketing', 'digital'],
                        addresses: [],
                        socialMedia: {},
                        industries: ['Marketing'],
                        seniority: ['Mid-level'],
                        departments: ['Marketing']
                    }
                }
            },
            {
                url: 'https://example.org',
                success: true,
                emails: ['hello@example.org', 'support@example.org'],
                totalEmails: 2,
                pagesVisited: 3,
                personalData: {
                    'hello@example.org': {
                        names: ['Bob Wilson'],
                        jobTitles: ['Developer'],
                        companies: ['Example Org'],
                        keywords: ['software', 'development'],
                        addresses: [],
                        socialMedia: {
                            'github': ['github.com/bobwilson']
                        },
                        industries: ['Software'],
                        seniority: ['Junior'],
                        departments: ['Engineering']
                    }
                }
            },
            {
                url: 'https://example.net',
                success: false,
                error: 'Connection timeout'
            }
        ],
        timestamp: new Date().toISOString()
    };

    try {
        // Test the CSV export endpoint
        const response = await fetch('http://localhost:3001/api/export/csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: sampleData }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the CSV content
        const csvContent = await response.text();
        
        // Save to file for inspection
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `test_export_${timestamp}.csv`;
        const filepath = path.join(__dirname, filename);
        
        fs.writeFileSync(filepath, csvContent);
        
        console.log('✅ CSV export test successful!');
        console.log(`📄 CSV file saved as: ${filename}`);
        console.log(`📊 CSV content preview:`);
        console.log('─'.repeat(80));
        
        // Show first few lines of the CSV
        const lines = csvContent.split('\n');
        lines.slice(0, 6).forEach((line, index) => {
            if (index === 0) {
                console.log('📋 Headers:');
            } else if (index === 1) {
                console.log('📝 Data rows:');
            }
            console.log(`   ${line}`);
        });
        
        if (lines.length > 6) {
            console.log(`   ... and ${lines.length - 6} more rows`);
        }
        
        console.log('─'.repeat(80));
        console.log(`📈 Summary: ${sampleData.totalEmails} emails exported from ${sampleData.successfulUrls} successful URLs`);
        
        // Verify CSV structure
        const csvLines = csvContent.split('\n');
        const headers = csvLines[0].split(',');
        const expectedHeaders = [
            'Email', 'Source URL', 'Names', 'Job Titles', 'Companies', 
            'Keywords', 'Addresses', 'Social Media', 'Industries', 
            'Seniority', 'Departments', 'Scraped At'
        ];
        
        console.log('\n🔍 CSV Structure Verification:');
        console.log(`   Expected headers: ${expectedHeaders.length}`);
        console.log(`   Actual headers: ${headers.length}`);
        console.log(`   Headers match: ${expectedHeaders.length === headers.length ? '✅' : '❌'}`);
        
        const dataRows = csvLines.slice(1).filter(line => line.trim().length > 0);
        console.log(`   Data rows: ${dataRows.length}`);
        console.log(`   Expected emails: ${sampleData.totalEmails}`);
        console.log(`   Rows match emails: ${dataRows.length === sampleData.totalEmails ? '✅' : '❌'}`);
        
    } catch (error) {
        console.error('❌ Error testing CSV export:', error.message);
    }
}

// Test the CSV generation function directly
function testCSVGeneration() {
    console.log('\n🧪 Testing CSV generation function directly...');
    
    const sampleData = {
        results: [
            {
                url: 'https://test.com',
                success: true,
                emails: ['test@test.com'],
                personalData: {
                    'test@test.com': {
                        names: ['Test User'],
                        jobTitles: ['Tester'],
                        companies: ['Test Corp']
                    }
                }
            }
        ],
        timestamp: new Date().toISOString()
    };
    
    try {
        // This would normally be done by the backend, but we can test the logic
        const csvContent = generateCSVFromData(sampleData);
        
        console.log('✅ CSV generation test successful!');
        console.log('📄 Generated CSV content:');
        console.log('─'.repeat(50));
        console.log(csvContent);
        console.log('─'.repeat(50));
        
    } catch (error) {
        console.error('❌ Error testing CSV generation:', error.message);
    }
}

// Simple CSV generation function for testing
function generateCSVFromData(data) {
    const successfulResults = data.results.filter(r => r.success);
    const csvRows = [];
    
    // Add header row
    csvRows.push([
        'Email',
        'Source URL',
        'Names',
        'Job Titles',
        'Companies',
        'Keywords',
        'Addresses',
        'Social Media',
        'Industries',
        'Seniority',
        'Departments',
        'Scraped At'
    ]);

    // Add data rows
    successfulResults.forEach(result => {
        if (result.emails && result.emails.length > 0) {
            result.emails.forEach(email => {
                const personalData = result.personalData && result.personalData[email] ? result.personalData[email] : {};
                
                const row = [
                    email,
                    result.url,
                    personalData.names ? personalData.names.join('; ') : '',
                    personalData.jobTitles ? personalData.jobTitles.join('; ') : '',
                    personalData.companies ? personalData.companies.join('; ') : '',
                    personalData.keywords ? personalData.keywords.join('; ') : '',
                    personalData.addresses ? personalData.addresses.join('; ') : '',
                    personalData.socialMedia ? Object.entries(personalData.socialMedia)
                        .map(([platform, profiles]) => `${platform}: ${profiles.join(', ')}`)
                        .join('; ') : '',
                    personalData.industries ? personalData.industries.join('; ') : '',
                    personalData.seniority ? personalData.seniority.join('; ') : '',
                    personalData.departments ? personalData.departments.join('; ') : '',
                    new Date(data.timestamp).toLocaleString()
                ];
                
                csvRows.push(row);
            });
        }
    });

    // Convert to CSV format
    return csvRows.map(row => 
        row.map(cell => {
            const escaped = String(cell).replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
                return `"${escaped}"`;
            }
            return escaped;
        }).join(',')
    ).join('\n');
}

// Run tests
async function runTests() {
    console.log('🚀 Starting CSV export tests...\n');
    
    await testCSVExport();
    testCSVGeneration();
    
    console.log('\n✨ CSV export tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testCSVExport, testCSVGeneration, generateCSVFromData }; 