const EmailScraper = require('./src/scrapers/EmailScraper');

// Create a test instance
const scraper = new EmailScraper();

// Test cases
const testEmails = [
    'help@mysite.ai.26.sms',
    'contact@example.com.extra',
    'info@test.org.123.abc',
    'user@domain.co.uk.xyz',
    'valid@email.com',
    'test@subdomain.example.com',
    'email@domain.com.26.sms',
    'contact@mysite.ai.extra.suffix',
    'info@test.com.123.456.789',
    'user@domain.org.abc.def.ghi'
];

console.log('Testing email cleaning functionality:\n');

testEmails.forEach(email => {
    const cleaned = scraper.cleanEmail(email);
    console.log(`Original: ${email}`);
    console.log(`Cleaned:  ${cleaned || 'INVALID'}`);
    console.log('---');
});

// Test text extraction
const testText = `
Contact us at help@mysite.ai.26.sms for support.
Email us at contact@example.com.extra for inquiries.
Visit info@test.org.123.abc for more information.
Valid email: valid@email.com
Another valid one: test@subdomain.example.com
`;

console.log('\nTesting text extraction:');
console.log('Original text:', testText);
console.log('Extracted emails:', scraper.extractEmailsFromText(testText)); 