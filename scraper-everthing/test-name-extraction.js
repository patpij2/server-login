require('dotenv').config();
const EmailScraper = require('./src/scrapers/EmailScraper');

/**
 * Test email name extraction and AI name generation
 */
function testEmailNameExtraction() {
    console.log('📧 Testing Email Name Extraction\n');
    
    const scraper = new EmailScraper();
    
    const testEmails = [
        'john.doe@company.com',
        'jane_smith@company.com',
        'johndoe@company.com',
        'j.doe@company.com',
        'john@company.com',
        'johnDoe@company.com',
        'john_doe_smith@company.com',
        'admin@company.com',
        'info@company.com',
        'contact@company.com',
        'sales@company.com',
        'support@company.com'
    ];
    
    console.log('📋 Test Results:');
    console.log('================');
    
    testEmails.forEach(email => {
        const extractedName = scraper.extractNamesFromEmail(email);
        const status = extractedName ? '✅' : '❌';
        console.log(`${status} ${email} -> ${extractedName || 'No name extracted'}`);
    });
    
    console.log('\n💡 Expected Results:');
    console.log('   • john.doe@company.com -> John Doe');
    console.log('   • jane_smith@company.com -> Jane Smith');
    console.log('   • johndoe@company.com -> Johndoe (or split attempt)');
    console.log('   • j.doe@company.com -> J Doe');
    console.log('   • john@company.com -> John');
    console.log('   • johnDoe@company.com -> John Doe');
    console.log('   • Generic emails (admin, info, etc.) -> No extraction');
}

/**
 * Test AI name generation with sample data
 */
async function testAINameGeneration() {
    console.log('\n🤖 Testing AI Name Generation\n');
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.log('❌ No OpenRouter API key found. Skipping AI test.');
        return;
    }
    
    const scraper = new EmailScraper({
        useAICategorization: true,
        openRouterApiKey: apiKey
    });
    
    // Sample data that might be found on a page
    const testData = {
        keywords: ['John', 'Doe', 'Software', 'Engineer', 'TechCorp', 'Development', 'Team', 'Lead'],
        jobTitles: ['Software Engineer', 'Team Lead'],
        companies: ['TechCorp Inc'],
        addresses: ['123 Main St, San Francisco, CA'],
        socialMedia: {
            linkedin: ['linkedin.com/in/johndoe'],
            twitter: ['twitter.com/johndoe']
        }
    };
    
    console.log('📊 Test Data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n🔄 Calling AI for name generation...');
    
    try {
        const startTime = Date.now();
        const result = await scraper.categorizeDataWithAI(testData);
        const duration = Date.now() - startTime;
        
        console.log(`✅ AI processing completed in ${duration}ms`);
        console.log('\n🎯 AI Results:');
        console.log('==============');
        
        if (result.names && result.names.length > 0) {
            console.log(`👤 Generated Names: ${result.names.join(', ')}`);
        } else {
            console.log('👤 No names generated');
        }
        
        if (result.keywords && result.keywords.length > 0) {
            console.log(`🏷️ Filtered Keywords: ${result.keywords.slice(0, 10).join(', ')}...`);
        }
        
        if (result.industries && result.industries.length > 0) {
            console.log(`🏭 Industries: ${result.industries.join(', ')}`);
        }
        
        if (result.seniority && result.seniority.length > 0) {
            console.log(`📈 Seniority: ${result.seniority.join(', ')}`);
        }
        
        console.log('\n📋 Full AI Response:');
        console.log(JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ AI test failed:', error.message);
    }
}

/**
 * Test complete name extraction workflow
 */
async function testCompleteWorkflow() {
    console.log('\n🔄 Testing Complete Name Extraction Workflow\n');
    
    const scraper = new EmailScraper({
        collectPersonalData: true,
        useAICategorization: true,
        openRouterApiKey: process.env.OPENROUTER_API_KEY
    });
    
    // Simulate data that would be extracted from a page
    const simulatedPageData = {
        emails: ['john.doe@techcorp.com', 'jane.smith@techcorp.com'],
        pageText: 'John Doe is a Senior Software Engineer at TechCorp. Jane Smith leads the Marketing team.',
        keywords: ['John', 'Doe', 'Senior', 'Software', 'Engineer', 'TechCorp', 'Jane', 'Smith', 'Marketing', 'Team', 'Lead']
    };
    
    console.log('📄 Simulated Page Data:');
    console.log(`   Emails: ${simulatedPageData.emails.join(', ')}`);
    console.log(`   Text: "${simulatedPageData.pageText}"`);
    console.log(`   Keywords: ${simulatedPageData.keywords.join(', ')}`);
    
    // Extract names from emails
    const emailNames = [];
    simulatedPageData.emails.forEach(email => {
        const extractedName = scraper.extractNamesFromEmail(email);
        if (extractedName) {
            emailNames.push(extractedName);
        }
    });
    
    console.log('\n📧 Email Name Extraction:');
    console.log(`   Extracted: ${emailNames.join(', ')}`);
    
    // Extract names from text
    const textNames = scraper.extractNamesWithContext(simulatedPageData.pageText);
    console.log('\n📝 Text Name Extraction:');
    console.log(`   Extracted: ${textNames.join(', ')}`);
    
    // Combine and prepare for AI
    const combinedNames = [...new Set([...emailNames, ...textNames])];
    console.log('\n🔗 Combined Names:');
    console.log(`   Combined: ${combinedNames.join(', ')}`);
    
    // Prepare data for AI processing
    const dataForAI = {
        names: combinedNames,
        keywords: simulatedPageData.keywords,
        jobTitles: ['Senior Software Engineer', 'Marketing Team Lead'],
        companies: ['TechCorp']
    };
    
    console.log('\n🤖 Sending to AI for enhancement...');
    
    try {
        const aiResult = await scraper.categorizeDataWithAI(dataForAI);
        
        console.log('\n✅ Final Results:');
        console.log('================');
        console.log(`👤 Names: ${aiResult.names ? aiResult.names.join(', ') : 'None'}`);
        console.log(`🏷️ Keywords: ${aiResult.keywords ? aiResult.keywords.slice(0, 10).join(', ') + '...' : 'None'}`);
        console.log(`🏭 Industries: ${aiResult.industries ? aiResult.industries.join(', ') : 'None'}`);
        console.log(`📈 Seniority: ${aiResult.seniority ? aiResult.seniority.join(', ') : 'None'}`);
        
    } catch (error) {
        console.error('❌ AI processing failed:', error.message);
    }
}

// Run the tests
if (require.main === module) {
    console.log('🚀 Name Extraction Test Suite\n');
    console.log('=' .repeat(50));
    
    // Test email name extraction
    testEmailNameExtraction();
    
    // Test AI name generation
    testAINameGeneration().then(() => {
        // Test complete workflow
        return testCompleteWorkflow();
    }).catch(error => {
        console.error('Test failed:', error);
    });
}

module.exports = { 
    testEmailNameExtraction, 
    testAINameGeneration, 
    testCompleteWorkflow 
}; 