const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const EmailScraper = require('./scrapers/EmailScraper');
const { validateUrl, validateScrapingOptions } = require('./utils/validators');
const { logger } = require('./utils/logger');
const fileStorage = require('./utils/fileStorage');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
    try {
        const { url, options = {} } = req.body;

        // Validate URL
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const validationResult = validateUrl(url);
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.error });
        }

        // Validate options
        const optionsValidation = validateScrapingOptions(options);
        if (!optionsValidation.isValid) {
            return res.status(400).json({ error: optionsValidation.error });
        }

        // Set default options
        const scrapingOptions = {
            maxDepth: options.maxDepth || 2,
            maxPages: options.maxPages || 50,
            delay: options.delay || 1000,
            headless: options.headless !== false,
            respectRobots: options.respectRobots !== false,
            skipImages: options.skipImages !== false,
            skipCSS: options.skipCSS !== false,
            skipFonts: options.skipFonts !== false,
            skipMedia: options.skipMedia !== false,
            timeout: options.timeout || 30000,
            collectPersonalData: options.collectPersonalData !== false,
            useAICategorization: options.useAICategorization !== false,
            openRouterApiKey: options.openRouterApiKey || process.env.OPENROUTER_API_KEY,
            restrictToPath: options.restrictToPath || ''
        };

        logger.info(`Starting scraping for URL: ${url}`, { options: scrapingOptions });

        // Create scraper instance
        const scraper = new EmailScraper(scrapingOptions);
        
        // Start scraping
        const result = await scraper.scrape(url);
        
        // Close browser
        await scraper.close();

        logger.info(`Scraping completed for URL: ${url}`, { 
            emailsFound: result.emails.length,
            pagesVisited: result.pagesVisited 
        });

        res.json({
            success: true,
            data: {
                url,
                emails: result.emails,
                totalEmails: result.emails.length,
                pagesVisited: result.pagesVisited,
                personalData: result.personalData,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Scraping error:', error);
        res.status(500).json({ 
            error: 'Scraping failed', 
            message: error.message 
        });
    }
});

// Fast scraping endpoint with real-time progress
app.post('/api/scrape/fast/progress', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const validationResult = validateUrl(url);
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.error });
        }

        logger.info(`Starting fast scraping with progress for URL: ${url}`);

        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Fast scraping options
        const fastOptions = {
            maxDepth: 2,
            maxPages: 50,
            delay: 500,
            headless: true,
            respectRobots: false,
            skipImages: true,
            skipCSS: true,
            skipFonts: true,
            skipMedia: true,
            timeout: 15000,
            collectPersonalData: req.body.options?.collectPersonalData !== false, // Default to true unless explicitly disabled
            useAICategorization: req.body.options?.useAICategorization !== false, // Default to true unless explicitly disabled
            openRouterApiKey: req.body.options?.openRouterApiKey || process.env.OPENROUTER_API_KEY,
            restrictToPath: req.body.options?.restrictToPath || '',
            onProgress: (progress) => {
                // Send progress update to client
                res.write(`data: ${JSON.stringify(progress)}\n\n`);
            }
        };

        const scraper = new EmailScraper(fastOptions);
        const result = await scraper.scrape(url);
        await scraper.close();

        // Send final result
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            success: true,
            data: {
                url,
                emails: result.emails,
                totalEmails: result.emails.length,
                pagesVisited: result.pagesVisited,
                personalData: result.personalData,
                mode: 'fast',
                timestamp: new Date().toISOString()
            }
        })}\n\n`);

        res.end();

        logger.info(`Fast scraping with progress completed for URL: ${url}`, { 
            emailsFound: result.emails.length,
            pagesVisited: result.pagesVisited 
        });

    } catch (error) {
        logger.error('Fast scraping with progress error:', error);
        
        // Send error to client
        res.write(`data: ${JSON.stringify({
            type: 'error',
            error: 'Fast scraping failed', 
            message: error.message 
        })}\n\n`);
        
        res.end();
    }
});

// Fast scraping endpoint (original)
app.post('/api/scrape/fast', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const validationResult = validateUrl(url);
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.error });
        }

        logger.info(`Starting fast scraping for URL: ${url}`);

        // Fast scraping options
        const fastOptions = {
            maxDepth: 2,
            maxPages: 50,
            delay: 500,
            headless: true,
            respectRobots: false,
            skipImages: true,
            skipCSS: true,
            skipFonts: true,
            skipMedia: true,
            timeout: 15000,
            collectPersonalData: true
        };

        const scraper = new EmailScraper(fastOptions);
        const result = await scraper.scrape(url);
        await scraper.close();

        logger.info(`Fast scraping completed for URL: ${url}`, { 
            emailsFound: result.emails.length,
            pagesVisited: result.pagesVisited 
        });

        res.json({
            success: true,
            data: {
                url,
                emails: result.emails,
                totalEmails: result.emails.length,
                pagesVisited: result.pagesVisited,
                personalData: result.personalData,
                mode: 'fast',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Fast scraping error:', error);
        res.status(500).json({ 
            error: 'Fast scraping failed', 
            message: error.message 
        });
    }
});

// Batch scraping endpoint
app.post('/api/scrape/batch', async (req, res) => {
    try {
        const { urls, options = {} } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'URLs array is required' });
        }

        if (urls.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 URLs allowed per batch' });
        }

        // Validate all URLs
        for (const url of urls) {
            const validationResult = validateUrl(url);
            if (!validationResult.isValid) {
                return res.status(400).json({ error: `Invalid URL: ${url} - ${validationResult.error}` });
            }
        }

        logger.info(`Starting batch scraping for ${urls.length} URLs`);

        const results = [];
        const scrapingOptions = {
            maxDepth: options.maxDepth || 2,
            maxPages: options.maxPages || 30,
            delay: options.delay || 1000,
            headless: true,
            respectRobots: options.respectRobots !== false,
            skipImages: options.skipImages !== false,
            skipCSS: options.skipCSS !== false,
            skipFonts: options.skipFonts !== false,
            skipMedia: options.skipMedia !== false,
            timeout: options.timeout || 30000,
            collectPersonalData: options.collectPersonalData !== false,
            useAICategorization: options.useAICategorization !== false,
            openRouterApiKey: options.openRouterApiKey || process.env.OPENROUTER_API_KEY,
            restrictToPath: options.restrictToPath || ''
        };

        for (const url of urls) {
            try {
                const scraper = new EmailScraper(scrapingOptions);
                const result = await scraper.scrape(url);
                await scraper.close();

                results.push({
                    url,
                    success: true,
                    emails: result.emails,
                    totalEmails: result.emails.length,
                    pagesVisited: result.pagesVisited,
                    personalData: result.personalData
                });

                logger.info(`Completed scraping for ${url}`, { emailsFound: result.emails.length });

            } catch (error) {
                logger.error(`Failed to scrape ${url}:`, error);
                results.push({
                    url,
                    success: false,
                    error: error.message
                });
            }
        }

        const totalEmails = results.reduce((sum, result) => sum + (result.totalEmails || 0), 0);

        res.json({
            success: true,
            data: {
                totalUrls: urls.length,
                successfulUrls: results.filter(r => r.success).length,
                failedUrls: results.filter(r => !r.success).length,
                totalEmails,
                results,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Batch scraping error:', error);
        res.status(500).json({ 
            error: 'Batch scraping failed', 
            message: error.message 
        });
    }
});

// CSV export endpoint
app.post('/api/export/csv', (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data || !data.results) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Generate CSV content
        const csvContent = generateCSVFromData(data);
        
        // Save to server storage
        const saveResult = fileStorage.saveCSV(csvContent, {
            totalUrls: data.totalUrls,
            successfulUrls: data.successfulUrls,
            failedUrls: data.failedUrls,
            totalEmails: data.totalEmails,
            source: 'api-export'
        });
        
        if (!saveResult.success) {
            logger.error('Failed to save CSV to server:', saveResult.error);
        }
        
        // Set headers for file download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `email_scraping_results_${timestamp}.csv`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);

    } catch (error) {
        logger.error('CSV export error:', error);
        res.status(500).json({ 
            error: 'CSV export failed', 
            message: error.message 
        });
    }
});

// Function to generate CSV from scraping data
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

// Get list of saved CSV files
app.get('/api/csv-files', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const result = fileStorage.getCSVFiles(limit);
        
        if (result.success) {
            res.json({
                success: true,
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Error getting CSV files:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get CSV files'
        });
    }
});

// Download specific CSV file
app.get('/api/csv-files/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const result = fileStorage.getCSVFile(filename);
        
        if (result.success) {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(result.content);
        } else {
            res.status(404).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Error downloading CSV file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download CSV file'
        });
    }
});

// Delete specific CSV file
app.delete('/api/csv-files/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const result = fileStorage.deleteCSVFile(filename);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(404).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Error deleting CSV file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete CSV file'
        });
    }
});

// Get storage statistics
app.get('/api/storage/stats', (req, res) => {
    try {
        const result = fileStorage.getStorageStats();
        
        if (result.success) {
            res.json({
                success: true,
                data: result.stats
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Error getting storage stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get storage statistics'
        });
    }
});

// Clean up old files
app.post('/api/storage/cleanup', (req, res) => {
    try {
        const { daysOld = 30 } = req.body;
        const result = fileStorage.cleanupOldFiles(daysOld);
        
        if (result.success) {
            res.json({
                success: true,
                message: `Cleaned up ${result.deletedCount} old files`,
                deletedCount: result.deletedCount
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Error cleaning up old files:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clean up old files'
        });
    }
});

// Get scraping status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        version: '1.0.0',
        endpoints: {
            '/api/scrape': 'POST - Standard scraping',
            '/api/scrape/fast': 'POST - Fast scraping',
            '/api/scrape/batch': 'POST - Batch scraping',
            '/api/export/csv': 'POST - Export results to CSV',
            '/api/csv-files': 'GET - List saved CSV files',
            '/api/csv-files/:filename': 'GET - Download specific CSV file',
            '/api/csv-files/:filename': 'DELETE - Delete specific CSV file',
            '/api/storage/stats': 'GET - Storage statistics',
            '/api/storage/cleanup': 'POST - Clean up old files',
            '/api/status': 'GET - Service status',
            '/health': 'GET - Health check'
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Scraper API server running on:`);
    logger.info(`  Local:   http://localhost:${PORT}`);
    logger.info(`  Network: http://192.168.1.92:${PORT}`); // use your actual IP
  });

module.exports = app; 