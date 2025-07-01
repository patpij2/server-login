const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const EmailScraper = require('./scrapers/EmailScraper');
const { validateUrl, validateScrapingOptions } = require('./utils/validators');
const { logger } = require('./utils/logger');

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
            collectPersonalData: options.collectPersonalData !== false
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

        if (urls.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 URLs allowed per batch' });
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
            collectPersonalData: options.collectPersonalData !== false
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

// Get scraping status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        version: '1.0.0',
        endpoints: {
            '/api/scrape': 'POST - Standard scraping',
            '/api/scrape/fast': 'POST - Fast scraping',
            '/api/scrape/batch': 'POST - Batch scraping',
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