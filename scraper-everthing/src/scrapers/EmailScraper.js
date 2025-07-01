const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const URLParse = require('url-parse');
const robotsParser = require('robots-parser');

class EmailScraper {
    constructor(options = {}) {
        this.options = {
            maxDepth: options.maxDepth || 3,
            maxPages: options.maxPages || 100,
            delay: options.delay || 1000,
            userAgent: options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            timeout: options.timeout || 30000,
            headless: options.headless !== false,
            respectRobots: options.respectRobots !== false,
            concurrentPages: options.concurrentPages || 1,
            skipImages: options.skipImages !== false,
            skipCSS: options.skipCSS !== false,
            skipFonts: options.skipFonts !== false,
            skipMedia: options.skipMedia !== false,
            onProgress: options.onProgress || null,
            ...options
        };
        
        this.visitedUrls = new Set();
        this.emails = new Set();
        this.browser = null;
        this.page = null;
        this.robotsCache = new Map();
    }

    // Email regex patterns for different formats
    getEmailPatterns() {
        return [
            // Standard email format with word boundaries
            /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
            // Obfuscated emails with [at] and [dot]
            /\b[a-zA-Z0-9._%+-]+\s*\[at\]\s*[a-zA-Z0-9.-]+\s*\[dot\]\s*[a-zA-Z]{2,}\b/g,
            // Obfuscated emails with (at) and (dot)
            /\b[a-zA-Z0-9._%+-]+\s*\(at\)\s*[a-zA-Z0-9.-]+\s*\(dot\)\s*[a-zA-Z]{2,}\b/g,
            // Emails with spaces around @ and .
            /\b[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}\b/g
        ];
    }

    // Clean and validate email addresses
    cleanEmail(email) {
        // Remove common obfuscation patterns
        let cleaned = email
            .replace(/\[at\]/g, '@')
            .replace(/\[dot\]/g, '.')
            .replace(/\(at\)/g, '@')
            .replace(/\(dot\)/g, '.')
            .replace(/\s+/g, '')
            .toLowerCase()
            .trim();

        // Remove specific problematic patterns that are clearly not part of valid emails
        // This handles cases like "help@mysite.ai.26.sms" -> "help@mysite.ai"
        
        // Pattern 1: Remove .number.letters at the end (like .26.sms)
        cleaned = cleaned.replace(/\.\d+\.\w+$/, '');
        
        // Pattern 2: Remove .letters.letters at the end if the second part is short (like .com.extra)
        cleaned = cleaned.replace(/\.\w+\.\w+$/, (match) => {
            const parts = match.split('.');
            if (parts[2] && parts[2].length <= 4) {
                return '.' + parts[1]; // Keep only the first part
            }
            return match; // Keep original if it might be valid
        });
        
        // Pattern 3: Remove trailing .letters if preceded by a valid TLD
        const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'ai', 'io', 'co', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'br', 'ru', 'it', 'nl', 'se', 'no', 'dk', 'fi', 'ie', 'at', 'ch', 'pl', 'pt', 'es', 'cz', 'hu', 'ro', 'bg', 'hr', 'rs', 'ba', 'si', 'mk', 'me', 'al', 'ad', 'li', 'mc', 'sm', 'va', 'mt', 'cy', 'gr', 'ee', 'lv', 'lt', 'lu', 'sk'];
        
        const domainMatch = cleaned.match(/@([a-zA-Z0-9.-]+)$/);
        if (domainMatch) {
            const domain = domainMatch[1];
            const domainParts = domain.split('.');
            
            if (domainParts.length > 2) {
                const lastPart = domainParts[domainParts.length - 1];
                const secondLastPart = domainParts[domainParts.length - 2];
                
                // If the second-to-last part is a valid TLD and the last part is short, remove the last part
                if (validTLDs.includes(secondLastPart.toLowerCase()) && lastPart.length <= 4) {
                    const newDomain = domainParts.slice(0, -1).join('.');
                    cleaned = cleaned.replace(domain, newDomain);
                }
            }
        }

        // Basic email validation with stricter domain validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(cleaned) ? cleaned : null;
    }

    // Extract emails from text content
    extractEmailsFromText(text) {
        const emails = new Set();
        const patterns = this.getEmailPatterns();

        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleaned = this.cleanEmail(match);
                    if (cleaned) {
                        emails.add(cleaned);
                    }
                });
            }
        });

        return Array.from(emails);
    }

    // Check robots.txt
    async checkRobotsTxt(baseUrl) {
        if (!this.options.respectRobots) return true;

        try {
            const parsedUrl = new URLParse(baseUrl);
            const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;

            if (this.robotsCache.has(robotsUrl)) {
                return this.robotsCache.get(robotsUrl);
            }

            const response = await axios.get(robotsUrl, { timeout: 5000 });
            const robots = robotsParser(robotsUrl, response.data);
            const canFetch = robots.isAllowed(baseUrl, this.options.userAgent);
            
            this.robotsCache.set(robotsUrl, canFetch);
            return canFetch;
        } catch (error) {
            console.log(`Could not fetch robots.txt for ${baseUrl}: ${error.message}`);
            return true; // Assume allowed if robots.txt is not accessible
        }
    }

    // Initialize browser
    async initBrowser() {
        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent(this.options.userAgent);
        await this.page.setViewport({ width: 1920, height: 1080 });

        // Set extra headers
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        });

        // Block unnecessary resources for faster loading
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            const resourceType = req.resourceType();
            const url = req.url();
            
            // Block resources based on options
            if (this.options.skipImages && resourceType === 'image') {
                req.abort();
            } else if (this.options.skipCSS && resourceType === 'stylesheet') {
                req.abort();
            } else if (this.options.skipFonts && resourceType === 'font') {
                req.abort();
            } else if (this.options.skipMedia && resourceType === 'media') {
                req.abort();
            } else if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    // Scrape a single page
    async scrapePage(url, depth = 0) {
        if (depth > this.options.maxDepth || this.visitedUrls.size >= this.options.maxPages) {
            return { emails: [], links: [] };
        }

        if (this.visitedUrls.has(url)) {
            return { emails: [], links: [] };
        }

        this.visitedUrls.add(url);
        console.log(`Scraping: ${url} (depth: ${depth})`);

        // Call progress callback
        if (this.options.onProgress) {
            this.options.onProgress({
                type: 'page_start',
                url: url,
                depth: depth,
                pagesVisited: this.visitedUrls.size,
                totalEmails: this.emails.size
            });
        }

        try {
            // Check robots.txt
            const canFetch = await this.checkRobotsTxt(url);
            if (!canFetch) {
                console.log(`Blocked by robots.txt: ${url}`);
                if (this.options.onProgress) {
                    this.options.onProgress({
                        type: 'page_blocked',
                        url: url,
                        reason: 'robots.txt'
                    });
                }
                return { emails: [], links: [] };
            }

            // Navigate to page
            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.options.timeout
            });

            // Wait for content to load (reduced wait time for speed)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get page content
            const content = await this.page.content();
            const $ = cheerio.load(content);

            // Extract emails from page content
            const pageText = $.text();
            const pageEmails = this.extractEmailsFromText(pageText);

            // Extract emails from href attributes
            const hrefEmails = [];
            $('a[href^="mailto:"]').each((i, el) => {
                const href = $(el).attr('href');
                const email = href.replace('mailto:', '').split('?')[0];
                const cleaned = this.cleanEmail(email);
                if (cleaned) hrefEmails.push(cleaned);
            });

            // Extract emails from data attributes and other sources
            const dataEmails = [];
            $('[data-email], [data-mail], [data-contact]').each((i, el) => {
                const dataEmail = $(el).attr('data-email') || $(el).attr('data-mail') || $(el).attr('data-contact');
                if (dataEmail) {
                    const cleaned = this.cleanEmail(dataEmail);
                    if (cleaned) dataEmails.push(cleaned);
                }
            });

            // Combine all emails
            const allEmails = [...new Set([...pageEmails, ...hrefEmails, ...dataEmails])];

            // Extract links for further crawling
            const links = [];
            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                    try {
                        const absoluteUrl = new URL(href, url).href;
                        const parsedUrl = new URLParse(absoluteUrl);
                        
                        // Only follow links from the same domain
                        const originalParsed = new URLParse(url);
                        if (parsedUrl.host === originalParsed.host) {
                            links.push(absoluteUrl);
                        }
                    } catch (error) {
                        // Skip invalid URLs
                    }
                }
            });

            // Add emails to global set
            allEmails.forEach(email => this.emails.add(email));

            // Call progress callback for emails found
            if (this.options.onProgress && allEmails.length > 0) {
                this.options.onProgress({
                    type: 'emails_found',
                    url: url,
                    emails: allEmails,
                    totalEmails: this.emails.size
                });
            }

            // Call progress callback for page completion
            if (this.options.onProgress) {
                this.options.onProgress({
                    type: 'page_complete',
                    url: url,
                    emailsFound: allEmails.length,
                    pagesVisited: this.visitedUrls.size,
                    totalEmails: this.emails.size
                });
            }

            console.log(`Found ${allEmails.length} emails on ${url}`);
            return { emails: allEmails, links: [...new Set(links)] };

        } catch (error) {
            console.error(`Error scraping ${url}: ${error.message}`);
            
            // Call progress callback for errors
            if (this.options.onProgress) {
                this.options.onProgress({
                    type: 'page_error',
                    url: url,
                    error: error.message
                });
            }
            
            return { emails: [], links: [] };
        }
    }

    // Recursive scraping with depth control
    async scrapeRecursive(urls, depth = 0) {
        if (depth > this.options.maxDepth || this.visitedUrls.size >= this.options.maxPages) {
            return;
        }

        const newUrls = [];
        
        for (const url of urls) {
            if (this.visitedUrls.size >= this.options.maxPages) break;
            
            const result = await this.scrapePage(url, depth);
            newUrls.push(...result.links);
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, this.options.delay));
        }

        if (newUrls.length > 0 && depth < this.options.maxDepth) {
            await this.scrapeRecursive([...new Set(newUrls)], depth + 1);
        }
    }

    // Main scraping method - returns results instead of saving to CSV
    async scrape(startUrl) {
        // Validate URL
        try {
            new URL(startUrl);
        } catch (error) {
            throw new Error(`Invalid URL: ${startUrl}`);
        }

        console.log(`Starting email scraping from: ${startUrl}`);
        console.log(`Max depth: ${this.options.maxDepth}, Max pages: ${this.options.maxPages}`);

        try {
            await this.initBrowser();
            await this.scrapeRecursive([startUrl], 0);
            
            const emails = Array.from(this.emails);
            
            console.log(`\nScraping completed!`);
            console.log(`Total pages visited: ${this.visitedUrls.size}`);
            console.log(`Total unique emails found: ${emails.length}`);
            
            return {
                emails,
                pagesVisited: this.visitedUrls.size,
                totalEmails: emails.length
            };
            
        } catch (error) {
            console.error('Scraping failed:', error);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    // Close browser
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = EmailScraper; 