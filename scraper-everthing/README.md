# Enhanced Email & Personal Data Scraper API

A production-ready RESTful API for extracting email addresses and comprehensive personal data from websites and marketplaces.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the API server
npm start

# Test the API
npm test
```

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/status` | GET | API information |
| `/api/scrape` | POST | Standard scraping |
| `/api/scrape/fast` | POST | Fast scraping |
| `/api/scrape/batch` | POST | Batch scraping |

## 🛠️ Usage Examples

### Fast Scraping
```bash
curl -X POST http://localhost:3001/api/scrape/fast \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Standard Scraping
```bash
curl -X POST http://localhost:3001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "maxDepth": 2,
      "maxPages": 50,
      "delay": 1000
    }
  }'
```

### Batch Scraping
```bash
curl -X POST http://localhost:3001/api/scrape/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example1.com",
      "https://example2.com"
    ]
  }'
```

## 📊 Response Format

### Basic Response (Email Only)
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "emails": ["contact@example.com", "info@example.com"],
    "totalEmails": 2,
    "pagesVisited": 15,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Enhanced Response (With Personal Data)
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
        "phones": ["+1-555-123-4567"],
        "names": ["John Doe"],
        "addresses": ["123 Main St, City, ST 12345"],
        "socialMedia": {
          "linkedin": ["linkedin.com/in/johndoe"]
        },
        "jobTitles": ["CEO"],
        "companies": ["Example Corp"],
        "sourceUrl": "https://example.com/team"
      }
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## ⚡ Performance

- **Fast mode**: 4x faster than standard mode
- **Resource blocking**: Skip images, CSS, fonts, media
- **Rate limiting**: 100 requests per 15 minutes per IP
- **Proven results**: 658 emails from Compass Real Estate

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3001)
- `LOG_LEVEL`: Logging level (error, warn, info, debug)
- `NODE_ENV`: Environment (development, production)

### Scraping Options
- `maxDepth`: 0-10 (default: 2)
- `maxPages`: 1-1000 (default: 50)
- `delay`: 0-10000ms (default: 1000)
- `timeout`: 5000-120000ms (default: 30000)
- `headless`: boolean (default: true)
- `respectRobots`: boolean (default: true)
- `skipImages`: boolean (default: false)
- `skipCSS`: boolean (default: false)
- `skipFonts`: boolean (default: false)
- `skipMedia`: boolean (default: false)
- `collectPersonalData`: boolean (default: false) - Enable personal data collection

## 📁 Project Structure

```
scraper-everthing/
├── src/
│   ├── index.js              # API server
│   │   └── EmailScraper.js   # Core scraping logic
│   └── utils/
│       ├── validators.js     # Input validation
│       └── logger.js         # Logging utility
├── package.json              # Dependencies
├── API_DOCUMENTATION.md      # Complete API docs
├── test-api.js               # API testing
└── README.md                 # This file
```

## 🎯 Use Cases

- **Lead generation** from business directories
- **Market research** and competitive analysis
- **Email marketing** campaigns
- **Real estate** agent contact collection
- **Business development** and networking
- **Customer profiling** with comprehensive contact data
- **Sales prospecting** with phone numbers and social profiles
- **CRM data enrichment** with additional contact information

## 🔒 Ethics & Compliance

- Respects robots.txt by default
- Built-in rate limiting prevents abuse
- Users must comply with website terms of service
- Use responsibly and ethically

## 📈 Success Metrics

- **Compass Real Estate**: 658 emails from 50 pages
- **Baldini Realty**: 22 emails from 40 pages
- **Fast mode**: 3-4x speed improvement
- **API response**: < 5 seconds for simple requests
- **Personal data collection**: Phone numbers, names, addresses, social profiles
- **Data quality**: Validated and cleaned contact information

## 🚀 Deployment

Ready for deployment to:
- Heroku
- AWS
- Docker containers
- Any cloud platform

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Personal Data Collection](PERSONAL_DATA_COLLECTION.md) - Enhanced features guide
- [Test Scripts](test-personal-data.js) - Example usage and testing

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md). 