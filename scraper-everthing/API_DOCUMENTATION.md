# Email Scraper API Documentation

A RESTful API for extracting email addresses from websites and marketplaces.

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. API Status
**GET** `/api/status`

Get API information and available endpoints.

**Response:**
```json
{
  "status": "running",
  "version": "1.0.0",
  "endpoints": {
    "/api/scrape": "POST - Standard scraping",
    "/api/scrape/fast": "POST - Fast scraping",
    "/api/scrape/batch": "POST - Batch scraping",
    "/api/status": "GET - Service status",
    "/health": "GET - Health check"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Standard Scraping
**POST** `/api/scrape`

Extract emails from a single website with customizable options.

**Request Body:**
```json
{
  "url": "https://example.com",
  "options": {
    "maxDepth": 2,
    "maxPages": 50,
    "delay": 1000,
    "headless": true,
    "respectRobots": true,
    "skipImages": false,
    "skipCSS": false,
    "skipFonts": false,
    "skipMedia": false,
    "timeout": 30000
  }
}
```

**Options:**
- `maxDepth` (number, 0-10): Maximum crawl depth (default: 2)
- `maxPages` (number, 1-1000): Maximum pages to visit (default: 50)
- `delay` (number, 0-10000): Delay between requests in ms (default: 1000)
- `headless` (boolean): Run browser in headless mode (default: true)
- `respectRobots` (boolean): Respect robots.txt (default: true)
- `skipImages` (boolean): Skip loading images (default: false)
- `skipCSS` (boolean): Skip loading CSS (default: false)
- `skipFonts` (boolean): Skip loading fonts (default: false)
- `skipMedia` (boolean): Skip loading media (default: false)
- `timeout` (number, 5000-120000): Page load timeout in ms (default: 30000)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "emails": [
      "contact@example.com",
      "info@example.com"
    ],
    "totalEmails": 2,
    "pagesVisited": 15,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Fast Scraping
**POST** `/api/scrape/fast`

Extract emails using optimized settings for maximum speed.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "emails": [
      "contact@example.com",
      "info@example.com"
    ],
    "totalEmails": 2,
    "pagesVisited": 15,
    "mode": "fast",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Batch Scraping
**POST** `/api/scrape/batch`

Extract emails from multiple websites (up to 10 URLs).

**Request Body:**
```json
{
  "urls": [
    "https://example1.com",
    "https://example2.com",
    "https://example3.com"
  ],
  "options": {
    "maxDepth": 2,
    "maxPages": 30,
    "delay": 1000,
    "respectRobots": true,
    "skipImages": false,
    "skipCSS": false,
    "skipFonts": false,
    "skipMedia": false,
    "timeout": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUrls": 3,
    "successfulUrls": 3,
    "failedUrls": 0,
    "totalEmails": 45,
    "results": [
      {
        "url": "https://example1.com",
        "success": true,
        "emails": ["contact@example1.com"],
        "totalEmails": 1,
        "pagesVisited": 10
      },
      {
        "url": "https://example2.com",
        "success": true,
        "emails": ["info@example2.com"],
        "totalEmails": 1,
        "pagesVisited": 8
      },
      {
        "url": "https://example3.com",
        "success": false,
        "error": "Page not found"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "URL is required"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Scraping failed",
  "message": "Page not found"
}
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

## Usage Examples

### cURL Examples

**Standard Scraping:**
```bash
curl -X POST http://localhost:3000/api/scrape \
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

**Fast Scraping:**
```bash
curl -X POST http://localhost:3000/api/scrape/fast \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

**Batch Scraping:**
```bash
curl -X POST http://localhost:3000/api/scrape/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example1.com",
      "https://example2.com"
    ]
  }'
```

### JavaScript Examples

**Standard Scraping:**
```javascript
const response = await fetch('http://localhost:3000/api/scrape', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      maxDepth: 2,
      maxPages: 50,
      delay: 1000
    }
  })
});

const result = await response.json();
console.log(result.data.emails);
```

**Fast Scraping:**
```javascript
const response = await fetch('http://localhost:3000/api/scrape/fast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});

const result = await response.json();
console.log(result.data.emails);
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (error, warn, info, debug) (default: info)
- `NODE_ENV`: Environment (development, production) (default: development)

## Ethical Considerations

- The API respects robots.txt by default
- Built-in rate limiting prevents abuse
- Users are responsible for complying with website terms of service
- Use responsibly and ethically

## Performance Tips

- Use the `/api/scrape/fast` endpoint for maximum speed
- Set `skipImages: true`, `skipCSS: true` for faster scraping
- Use batch scraping for multiple URLs
- Monitor rate limits to avoid being blocked 