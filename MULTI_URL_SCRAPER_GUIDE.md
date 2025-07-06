# Multi-URL Email Scraper Guide

## Overview

The email scraper has been enhanced to support batch processing of multiple websites simultaneously. This allows you to scrape emails from multiple URLs in a single operation, making it much more efficient for large-scale email collection.

## New Features

### 1. Multi-URL Input
- **Textarea Interface**: Instead of a single URL input, you now have a textarea where you can enter multiple URLs
- **One URL per line**: Each URL should be on a separate line
- **Maximum 10 URLs**: The system limits batch operations to 10 URLs for performance reasons
- **Real-time validation**: The interface shows a count of entered URLs and warns if you exceed the limit

### 2. Batch Processing
- **Parallel Processing**: URLs are processed sequentially to avoid overwhelming target servers
- **Individual Results**: Each URL is processed independently, so if one fails, others continue
- **Comprehensive Reporting**: Detailed results for each URL including success/failure status

### 3. Enhanced Results Display
- **Summary Statistics**: Overview of total URLs, successful/failed counts, and total emails found
- **Individual URL Results**: Table showing the status of each URL with details
- **Combined Email List**: All emails found across all URLs in a single table
- **Personal Data Aggregation**: Personal data from all successful scrapes combined
- **CSV Export**: Download all results as a CSV file for further analysis

## How to Use

### 1. Access the Scraper
1. Log into the dashboard
2. Navigate to the "Email & Personal Data Scraper" section

### 2. Enter Multiple URLs
```
https://example.com
https://example.org
https://example.net
https://company1.com
https://company2.com
```

### 3. Configure Options
- **Collect Personal Data**: Enable to gather names, addresses, social media profiles, etc.
- **AI Categorization**: Use AI to categorize contacts by industry, seniority, and department
- **Path Restriction**: Limit scraping to specific URL patterns (optional)

### 4. Start Batch Scraping
- Click "🔍 Start Batch Scraping"
- The system will process each URL sequentially
- Results will be displayed in real-time

## Results Interpretation

### Summary Section
- **Total URLs**: Number of URLs submitted
- **Successful**: URLs that were scraped successfully
- **Failed**: URLs that encountered errors
- **Total Emails**: Combined count of all emails found
- **Total Pages**: Combined count of all pages visited

### Individual Results Table
- **Status**: ✅ Success or ❌ Failed
- **Emails Found**: Number of emails found on that URL
- **Pages Visited**: Number of pages scraped
- **Error**: Error message if the URL failed

### Combined Email List
- All emails found across all successful URLs
- Source URL for each email
- Timestamp of when scraping occurred

### CSV Export
- **Export Button**: Available when emails are found
- **Comprehensive Data**: Includes all emails and personal data
- **Structured Format**: CSV with headers for easy import into spreadsheets
- **Automatic Download**: File downloads immediately when generated

## API Endpoint

The batch functionality is available via the API endpoint:

```
POST /api/scrape/batch
```

### CSV Export Endpoint
```
POST /api/export/csv
```

### Request Body
```json
{
  "urls": [
    "https://example.com",
    "https://example.org",
    "https://example.net"
  ],
  "options": {
    "collectPersonalData": true,
    "useAICategorization": true,
    "restrictToPath": "",
    "maxDepth": 2,
    "maxPages": 30,
    "delay": 1000
  }
}
```

### Response
```json
{
  "success": true,
  "data": {
    "totalUrls": 3,
    "successfulUrls": 2,
    "failedUrls": 1,
    "totalEmails": 15,
    "results": [
      {
        "url": "https://example.com",
        "success": true,
        "emails": ["contact@example.com", "info@example.com"],
        "totalEmails": 2,
        "pagesVisited": 5,
        "personalData": { ... }
      },
      {
        "url": "https://example.org",
        "success": false,
        "error": "Connection timeout"
      }
    ],
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### CSV Export Request
```json
{
  "data": {
    "totalUrls": 3,
    "successfulUrls": 2,
    "failedUrls": 1,
    "totalEmails": 15,
    "results": [
      {
        "url": "https://example.com",
        "success": true,
        "emails": ["contact@example.com", "info@example.com"],
        "totalEmails": 2,
        "pagesVisited": 5,
        "personalData": { ... }
      }
    ],
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### CSV Export Response
The endpoint returns a CSV file with the following headers:
- Email
- Source URL
- Names
- Job Titles
- Companies
- Keywords
- Addresses
- Social Media
- Industries
- Seniority
- Departments
- Scraped At

## Best Practices

### 1. URL Selection
- Use diverse, relevant URLs for better results
- Avoid very large sites that might take too long
- Test with a few URLs first before large batches

### 2. Performance Optimization
- Keep batch size under 10 URLs for optimal performance
- Use path restrictions when possible to limit scope
- Consider using shorter delays for faster processing

### 3. Error Handling
- Failed URLs don't affect successful ones
- Check error messages to understand why URLs failed
- Retry failed URLs individually if needed

## Troubleshooting

### Common Issues

1. **"Maximum 10 URLs allowed"**
   - Reduce the number of URLs in your batch
   - Split large batches into smaller groups

2. **"Invalid URL" errors**
   - Ensure URLs include the protocol (http:// or https://)
   - Check for typos in URLs
   - Verify URLs are accessible

3. **Timeout errors**
   - Some websites may be slow to respond
   - Consider increasing the timeout setting
   - Try scraping during off-peak hours

4. **No emails found**
   - Some websites may not have publicly visible emails
   - Check if the website uses JavaScript to load content
   - Verify the website structure hasn't changed

## Technical Details

### Backend Changes
- Enhanced batch endpoint to handle multiple URLs
- Added support for AI categorization in batch mode
- Improved error handling for individual URL failures
- Added path restriction support for batch operations

### Frontend Changes
- Replaced single URL input with multi-line textarea
- Added real-time URL counting and validation
- Enhanced results display with batch-specific formatting
- Added comprehensive error reporting
- Added CSV export functionality with automatic file download

### Performance Considerations
- Sequential processing to avoid overwhelming servers
- Configurable delays between requests
- Memory-efficient processing of large result sets
- Timeout handling for slow-responding sites

## Future Enhancements

Potential improvements for future versions:
- Parallel processing with configurable concurrency
- Resume interrupted batch operations
- Export results in additional formats (Excel, JSON)
- Scheduled batch scraping
- Advanced filtering and deduplication
- Integration with CRM systems
- Database storage for historical results 