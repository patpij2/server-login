# Enhanced Personal Data Collection

## Overview

The email scraper has been enhanced to collect comprehensive personal data beyond just email addresses. This feature allows you to gather detailed information about customers and contacts found on websites.

## Features

### 🔍 Data Types Collected

1. **Email Addresses** - Primary contact method
2. **Phone Numbers** - Multiple formats supported
3. **Names** - Full names, titles, and variations
4. **Addresses** - Physical addresses and P.O. boxes
5. **Social Media Profiles** - LinkedIn, Twitter, Facebook, Instagram, YouTube
6. **Job Titles** - Professional positions and roles
7. **Company Information** - Organization names and affiliations

### 📱 Phone Number Detection

Supports multiple phone number formats:
- International: `+1-555-123-4567`
- US Format: `(555) 123-4567`
- Simple: `555-123-4567`
- 10-digit: `5551234567`
- 11-digit: `15551234567`

### 👤 Name Detection

Recognizes various name formats:
- Full names: `John Doe`
- With middle initial: `John A. Doe`
- With titles: `Mr. John Doe`, `Dr. Jane Smith`

### 🏠 Address Detection

Finds structured addresses:
- Street addresses: `123 Main St, City, State ZIP`
- P.O. Boxes: `P.O. Box 123, City, State ZIP`

### 🌐 Social Media Detection

Extracts profiles from:
- LinkedIn: `linkedin.com/in/username`
- Twitter/X: `twitter.com/username`
- Facebook: `facebook.com/username`
- Instagram: `instagram.com/username`
- YouTube: `youtube.com/channel/username`

## Usage

### Basic Usage

```javascript
const EmailScraper = require('./src/scrapers/EmailScraper');

const scraper = new EmailScraper({
    collectPersonalData: true, // Enable personal data collection
    maxDepth: 2,
    maxPages: 50
});

const result = await scraper.scrape('https://example.com');
console.log(result.personalData);
```

### API Usage

```bash
# Standard scraping with personal data
curl -X POST http://localhost:3001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "collectPersonalData": true,
      "maxDepth": 2,
      "maxPages": 50
    }
  }'

# Fast scraping with personal data (enabled by default)
curl -X POST http://localhost:3001/api/scrape/fast \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

## Response Format

### Personal Data Structure

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "emails": ["john@example.com", "jane@example.com"],
    "totalEmails": 2,
    "pagesVisited": 15,
    "personalData": {
      "john@example.com": {
        "phones": ["+1-555-123-4567", "(555) 987-6543"],
        "names": ["John Doe", "John A. Doe"],
        "addresses": ["123 Main St, City, ST 12345"],
        "socialMedia": {
          "linkedin": ["linkedin.com/in/johndoe"],
          "twitter": ["twitter.com/johndoe"]
        },
        "jobTitles": ["CEO", "Founder"],
        "companies": ["Example Corp"],
        "sourceUrl": "https://example.com/team"
      },
      "jane@example.com": {
        "phones": ["555-456-7890"],
        "names": ["Jane Smith"],
        "addresses": [],
        "socialMedia": {
          "linkedin": ["linkedin.com/in/janesmith"]
        },
        "jobTitles": ["CTO"],
        "companies": ["Example Corp"],
        "sourceUrl": "https://example.com/team"
      }
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Configuration Options

### Personal Data Collection Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collectPersonalData` | boolean | `false` | Enable/disable personal data collection |
| `maxDepth` | number | `3` | Maximum crawl depth |
| `maxPages` | number | `100` | Maximum pages to visit |
| `delay` | number | `1000` | Delay between requests (ms) |

### Performance Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headless` | boolean | `true` | Run browser in headless mode |
| `skipImages` | boolean | `false` | Skip loading images |
| `skipCSS` | boolean | `false` | Skip loading CSS |
| `skipFonts` | boolean | `false` | Skip loading fonts |
| `skipMedia` | boolean | `false` | Skip loading media |

## Data Extraction Methods

### 1. HTML Element Targeting

The scraper targets specific HTML elements:
- Contact info: `[class*="contact"]`, `[class*="phone"]`, `[id*="contact"]`
- Names: `[class*="name"]`, `[class*="author"]`, `[id*="name"]`
- Addresses: `[class*="address"]`, `[class*="location"]`
- Job info: `[class*="title"]`, `[class*="position"]`, `[class*="company"]`

### 2. Text Pattern Matching

Uses regex patterns to extract data from page text:
- Email patterns with obfuscation support
- Phone number patterns for various formats
- Name patterns with title support
- Address patterns for structured addresses
- Social media URL patterns

### 3. Link Analysis

Extracts social media profiles from:
- `mailto:` links
- Social media platform links
- Data attributes (`data-email`, `data-contact`)

## Data Quality Features

### Email Validation
- Removes obfuscation patterns (`[at]`, `[dot]`, `(at)`, `(dot)`)
- Validates domain structure
- Cleans common formatting issues

### Phone Number Cleaning
- Removes non-numeric characters (except `+`, `(`, `)`, `-`)
- Validates minimum digit count (10+ digits)
- Standardizes formatting

### Name Processing
- Removes extra whitespace
- Validates proper capitalization
- Filters out very short names

## Privacy and Ethics

### Important Considerations

1. **Respect robots.txt** - Always enable `respectRobots: true`
2. **Rate limiting** - Use appropriate delays between requests
3. **Legal compliance** - Ensure compliance with local data protection laws
4. **Terms of service** - Respect website terms of service
5. **Data usage** - Use collected data responsibly and ethically

### Best Practices

- Only scrape publicly available information
- Implement proper rate limiting
- Respect website terms of service
- Handle personal data securely
- Consider data retention policies

## Testing

### Run Test Script

```bash
cd scraper-everthing
node test-personal-data.js
```

### Test with Real Website

```javascript
const testUrl = 'https://your-test-website.com';
// Replace with a real website for testing
```

## Troubleshooting

### Common Issues

1. **No personal data found**
   - Check if `collectPersonalData: true` is set
   - Verify website has contact information
   - Check HTML structure for target elements

2. **Incomplete data**
   - Increase `maxDepth` and `maxPages`
   - Check for JavaScript-rendered content
   - Verify page loading timeout

3. **Performance issues**
   - Enable resource skipping (`skipImages`, `skipCSS`)
   - Reduce `maxDepth` and `maxPages`
   - Increase `delay` between requests

### Debug Mode

Enable detailed logging:

```javascript
const scraper = new EmailScraper({
    collectPersonalData: true,
    onProgress: (progress) => {
        console.log('Progress:', progress);
    }
});
```

## API Endpoints

### Standard Scraping
- `POST /api/scrape` - Full scraping with options
- `POST /api/scrape/fast` - Fast scraping (personal data enabled)
- `POST /api/scrape/batch` - Batch scraping multiple URLs

### Progress Tracking
- `POST /api/scrape/fast/progress` - Real-time progress updates

### Status
- `GET /api/status` - Service status and endpoints
- `GET /health` - Health check

## Examples

### Complete Example

```javascript
const EmailScraper = require('./src/scrapers/EmailScraper');

async function scrapeWithPersonalData() {
    const scraper = new EmailScraper({
        collectPersonalData: true,
        maxDepth: 3,
        maxPages: 100,
        delay: 1000,
        respectRobots: true,
        onProgress: (progress) => {
            if (progress.type === 'emails_found' && progress.personalData) {
                console.log(`Found ${progress.emails.length} emails with personal data`);
            }
        }
    });

    try {
        const result = await scraper.scrape('https://example.com');
        
        console.log(`Found ${result.totalEmails} emails`);
        console.log(`Personal data for ${Object.keys(result.personalData).length} contacts`);
        
        // Process personal data
        Object.entries(result.personalData).forEach(([email, data]) => {
            console.log(`\nContact: ${email}`);
            console.log(`Names: ${data.names.join(', ')}`);
            console.log(`Phones: ${data.phones.join(', ')}`);
            console.log(`Addresses: ${data.addresses.join(', ')}`);
        });
        
    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await scraper.close();
    }
}

scrapeWithPersonalData();
```

This enhanced scraper provides comprehensive personal data collection capabilities while maintaining performance and respecting website policies. 