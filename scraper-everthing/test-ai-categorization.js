require('dotenv').config();
const EmailScraper = require('./src/scrapers/EmailScraper');

/**
 * Test AI categorization with OpenRouter API
 */
async function testAICategorization() {
    console.log('🤖 Testing AI Categorization with OpenRouter\n');
    
    // Check if API key is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('❌ OPENROUTER_API_KEY not found in environment variables');
        console.log('💡 Make sure your .env file contains: OPENROUTER_API_KEY=your-key-here');
        return;
    }
    
    console.log('✅ OpenRouter API key found');
    console.log(`🔑 Key preview: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log('');
    
    // Create scraper with AI categorization enabled
    const scraper = new EmailScraper({
        useAICategorization: true,
        openRouterApiKey: apiKey
    });
    
    // Test data that would typically be extracted from a website
    const testData = {
        names: ["John Doe", "Jane Smith"],
        jobTitles: ["Software Engineer", "Marketing Manager"],
        companies: ["TechCorp Inc"],
        addresses: ["123 Main St, San Francisco, CA"],
        socialMedia: {
            linkedin: ["linkedin.com/in/johndoe"],
            twitter: ["twitter.com/janesmith"]
        }
    };
    
    console.log('📊 Test Data to Categorize:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');
    
    try {
        console.log('🔄 Calling AI categorization...');
        const startTime = Date.now();
        
        const categorizedData = await scraper.categorizeDataWithAI(testData);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ AI categorization completed in ${duration}ms`);
        console.log('');
        
        console.log('🎯 AI Categorization Results:');
        console.log('=============================');
        
        if (categorizedData.industries) {
            console.log(`🏭 Industries: ${categorizedData.industries.join(', ')}`);
        }
        
        if (categorizedData.seniority) {
            console.log(`📈 Seniority: ${categorizedData.seniority.join(', ')}`);
        }
        
        if (categorizedData.departments) {
            console.log(`🏢 Departments: ${categorizedData.departments.join(', ')}`);
        }
        
        if (categorizedData.confidence) {
            console.log(`🎯 Confidence: ${(categorizedData.confidence * 100).toFixed(1)}%`);
        }
        
        console.log('');
        console.log('📋 Full AI Response:');
        console.log(JSON.stringify(categorizedData, null, 2));
        
    } catch (error) {
        console.error('❌ AI categorization failed:', error.message);
        
        if (error.message.includes('401')) {
            console.log('💡 This might be an authentication issue. Check your OpenRouter API key.');
        } else if (error.message.includes('429')) {
            console.log('💡 Rate limit exceeded. Try again in a moment.');
        } else if (error.message.includes('fetch')) {
            console.log('💡 Network error. Check your internet connection.');
        }
    }
}

// Test the AI categorization directly with OpenRouter
async function testDirectOpenRouter() {
    console.log('\n🔧 Testing Direct OpenRouter API Call\n');
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('❌ No API key available');
        return;
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://email-scraper-dashboard.com',
                'X-Title': 'Email Scraper AI Test'
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that categorizes contact data. Return only valid JSON.'
                    },
                    {
                        role: 'user',
                        content: 'Categorize this data: {"names": ["John Doe"], "jobTitles": ["Software Engineer"]}'
                    }
                ],
                max_tokens: 200,
                temperature: 0.1
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Direct API call successful');
        console.log('📄 Response:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ Direct API call failed:', error.message);
    }
}

// Run the tests
if (require.main === module) {
    console.log('🚀 AI Categorization Test Suite\n');
    console.log('=' .repeat(50));
    
    // Test direct API call first
    testDirectOpenRouter().then(() => {
        // Then test the scraper's AI categorization
        return testAICategorization();
    }).catch(error => {
        console.error('Test failed:', error);
    });
}

module.exports = { testAICategorization, testDirectOpenRouter }; 