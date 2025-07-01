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
            collectPersonalData: options.collectPersonalData !== false,
            useAICategorization: options.useAICategorization !== false, // Enable AI categorization
            openRouterApiKey: options.openRouterApiKey || process.env.OPENROUTER_API_KEY, // OpenRouter API key
            restrictToPath: options.restrictToPath || '',
            ...options
        };
        
        this.visitedUrls = new Set();
        this.emails = new Set();
        this.personalData = new Map();
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

    // Enhanced name patterns with better context detection
    getEnhancedNamePatterns() {
        return [
            // Full name with title: Mr. John Doe, Dr. Jane Smith
            /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sir|Madam|Lady)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
            // Full name with middle initial: John A. Doe, Jane B. Smith
            /\b[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+\b/g,
            // Full name: John Doe, Jane Smith
            /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
            // Name with prefix/suffix: John Doe Jr., Jane Smith III
            /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+(Jr\.|Sr\.|I|II|III|IV)\b/g,
            // Name in quotes: "John Doe", 'Jane Smith'
            /["'][A-Z][a-z]+\s+[A-Z][a-z]+["']/g,
            // Name in parentheses: (John Doe), [Jane Smith]
            /[\(\[][A-Z][a-z]+\s+[A-Z][a-z]+[\)\]]/g
        ];
    }

    // Smart name extraction with context analysis
    extractNamesWithContext(text) {
        const names = new Set();
        const patterns = this.getEnhancedNamePatterns();
        
        // Extract names using patterns
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleaned = this.cleanName(match);
                    if (cleaned && this.isValidName(cleaned)) {
                        names.add(cleaned);
                    }
                });
            }
        });
        
        // Additional context-based extraction
        const contextNames = this.extractNamesFromContext(text);
        contextNames.forEach(name => names.add(name));
        
        return Array.from(names);
    }
    
    // Extract names based on context clues
    extractNamesFromContext(text) {
        const names = new Set();
        
        // Look for names near email addresses
        const emailNamePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s*[<\[\(]?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[>\]\)]?/g;
        let match;
        while ((match = emailNamePattern.exec(text)) !== null) {
            const name = this.cleanName(match[1]);
            if (name && this.isValidName(name)) {
                names.add(name);
            }
        }
        
        // Look for names near job titles
        const jobTitlePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s*[,:]\s*(CEO|CTO|CFO|COO|VP|Director|Manager|Lead|Senior|Junior|Developer|Engineer|Designer|Analyst|Consultant|Specialist|Coordinator|Assistant|Intern)/gi;
        while ((match = jobTitlePattern.exec(text)) !== null) {
            const name = this.cleanName(match[1]);
            if (name && this.isValidName(name)) {
                names.add(name);
            }
        }
        
        // Look for names in contact sections
        const contactPattern = /(?:contact|about|team|staff|member)[\s\S]*?([A-Z][a-z]+\s+[A-Z][a-z]+)/gi;
        while ((match = contactPattern.exec(text)) !== null) {
            const name = this.cleanName(match[1]);
            if (name && this.isValidName(name)) {
                names.add(name);
            }
        }
        
        return Array.from(names);
    }
    
    // Validate if a name is likely to be a real person's name
    isValidName(name) {
        // Remove common false positives
        const falsePositives = [
            'About Us', 'Contact Us', 'Privacy Policy', 'Terms of Service',
            'Home Page', 'Main Menu', 'Navigation', 'Footer', 'Header',
            'Search Results', 'Page Title', 'Meta Description', 'Alt Text',
            'Click Here', 'Read More', 'Learn More', 'Get Started',
            'Sign Up', 'Log In', 'Subscribe', 'Newsletter', 'Blog Post',
            'Product Name', 'Company Name', 'Brand Name', 'Service Name',
            'About Our', 'Our Services', 'Contact Information', 'Team Members',
            'Leadership Team', 'Navigation Menu', 'Main Menu', 'Side Menu',
            'Top Menu', 'Bottom Menu', 'Footer Menu', 'Header Menu'
        ];
        
        if (falsePositives.some(fp => name.toLowerCase().includes(fp.toLowerCase()))) {
            return false;
        }
        
        // Check for reasonable name length (2-4 words)
        const words = name.split(' ').filter(word => word.length > 0);
        if (words.length < 2 || words.length > 4) {
            return false;
        }
        
        // Check that each word starts with capital letter
        if (!words.every(word => /^[A-Z]/.test(word))) {
            return false;
        }
        
        // Check for reasonable word lengths
        if (!words.every(word => word.length >= 2 && word.length <= 20)) {
            return false;
        }
        
        // Additional checks for navigation/common words
        const navigationWords = ['About', 'Contact', 'Home', 'Menu', 'Navigation', 'Services', 'Products', 'Company', 'Team', 'Our', 'The', 'And', 'Or', 'But', 'For', 'With', 'From', 'To', 'In', 'On', 'At', 'By', 'Of', 'A', 'An', 'The'];
        if (words.some(word => navigationWords.includes(word))) {
            return false;
        }
        
        return true;
    }

    // Social media patterns
    getSocialMediaPatterns() {
        return {
            linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/company\/)[a-zA-Z0-9\-_]+/g,
            twitter: /(?:twitter\.com\/|x\.com\/)[a-zA-Z0-9_]+/g,
            facebook: /(?:facebook\.com\/|fb\.com\/)[a-zA-Z0-9.]+/g,
            instagram: /instagram\.com\/[a-zA-Z0-9._]+/g,
            youtube: /(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/user\/)[a-zA-Z0-9\-_]+/g
        };
    }

    // Address patterns
    getAddressPatterns() {
        return [
            // Street address: 123 Main St, City, State ZIP
            /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter|Circle|Cir),?\s+[A-Za-z\s]+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?/g,
            // P.O. Box: P.O. Box 123, City, State ZIP
            /P\.?O\.?\s*Box\s+\d+,?\s+[A-Za-z\s]+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?/g
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

    // Extract candidate keywords from the page
    extractKeywordsFromPage($, pageText) {
        const keywords = new Set();
        // 1. Headings
        $('h1, h2, h3, h4, h5, h6').each((i, el) => {
            $(el).text().split(/\s+/).forEach(word => {
                if (word.length > 2) keywords.add(word.trim());
            });
        });
        // 2. Bold/strong text
        $('b, strong').each((i, el) => {
            $(el).text().split(/\s+/).forEach(word => {
                if (word.length > 2) keywords.add(word.trim());
            });
        });
        // 3. Existing name extraction
        this.extractNamesWithContext(pageText).forEach(name => keywords.add(name));
        // 4. Company/job titles
        this.extractPersonalDataFromHTML($).companies.forEach(company => keywords.add(company));
        this.extractPersonalDataFromHTML($).jobTitles.forEach(title => keywords.add(title));
        // 5. Remove duplicates, lowercase, and filter out common stopwords
        const stopwords = [
            'About', 'Contact', 'Home', 'Menu', 'Navigation', 'Services', 'Products', 'Company', 'Team', 'Our', 'The', 'And', 'Or', 'But', 'For', 'With', 'From', 'To', 'In', 'On', 'At', 'By', 'Of', 'A', 'An', 'Page', 'More', 'Click', 'Here', 'Read', 'Learn', 'Get', 'Started', 'Sign', 'Up', 'Log', 'Subscribe', 'Newsletter', 'Blog', 'Post', 'Name', 'Brand', 'Service', 'Main', 'Footer', 'Header', 'Results', 'Title', 'Description', 'Alt', 'Text', 'Privacy', 'Policy', 'Terms'
        ];
        return Array.from(keywords)
            .map(k => k.trim())
            .filter(k => k.length > 2 && !stopwords.includes(k))
            .slice(0, 100);
    }

    // Extract names from email addresses
    extractNamesFromEmail(email) {
        const localPart = email.split('@')[0];
        if (!localPart) return null;
        
        // Skip generic email addresses
        const genericEmails = ['admin', 'info', 'contact', 'sales', 'support', 'help', 'noreply', 'no-reply', 'webmaster', 'postmaster', 'root', 'test', 'demo', 'example'];
        if (genericEmails.includes(localPart.toLowerCase())) {
            return null;
        }
        
        // Common patterns for email to name conversion
        const patterns = [
            // john.doe@company.com -> John Doe
            /^([a-z]+)\.([a-z]+)$/i,
            // john_doe@company.com -> John Doe
            /^([a-z]+)_([a-z]+)$/i,
            // j.doe@company.com -> J Doe
            /^([a-z])\.([a-z]+)$/i,
            // john@company.com -> John (only if it's a reasonable name)
            /^([a-z]{2,10})$/i
        ];
        
        for (const pattern of patterns) {
            const match = localPart.match(pattern);
            if (match) {
                if (match.length === 3) {
                    // Two parts: firstname.lastname or firstname_lastname
                    const firstName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
                    const lastName = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
                    
                    // Validate that these look like real names
                    if (firstName.length >= 2 && lastName.length >= 2) {
                        return `${firstName} ${lastName}`;
                    }
                } else if (match.length === 2) {
                    // Single part: just firstname (only for reasonable lengths)
                    const firstName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
                    if (firstName.length >= 2 && firstName.length <= 10) {
                        return firstName;
                    }
                }
            }
        }
        
        // Try camelCase pattern: johnDoe@company.com -> John Doe
        const camelCaseMatch = localPart.match(/^([a-z]+)([A-Z][a-z]+)$/);
        if (camelCaseMatch) {
            const firstName = camelCaseMatch[1].charAt(0).toUpperCase() + camelCaseMatch[1].slice(1).toLowerCase();
            const lastName = camelCaseMatch[2];
            if (firstName.length >= 2 && lastName.length >= 2) {
                return `${firstName} ${lastName}`;
            }
        }
        
        // Try to split long strings that might be concatenated names
        if (localPart.length >= 6 && localPart.length <= 15) {
            // Look for patterns like "johndoe" -> "John Doe"
            const splitMatch = localPart.match(/^([a-z]{3,8})([a-z]{3,8})$/i);
            if (splitMatch) {
                const firstName = splitMatch[1].charAt(0).toUpperCase() + splitMatch[1].slice(1).toLowerCase();
                const lastName = splitMatch[2].charAt(0).toUpperCase() + splitMatch[2].slice(1).toLowerCase();
                return `${firstName} ${lastName}`;
            }
        }
        
        return null;
    }
    
    // Enhanced AI categorization that also generates names
    async categorizeDataWithAI(data) {
        if (!this.options.useAICategorization) {
            return data;
        }

        try {
            const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.options.openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://email-scraper-dashboard.com',
                    'X-Title': 'Email Scraper AI Categorization'
                },
                body: JSON.stringify({
                    model: 'google/gemini-flash-1.5',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an AI assistant that processes contact and business data. 
                            Given the provided data, return a JSON object with these fields:
                            {
                                "names": ["extracted or inferred person names"],
                                "keywords": ["20-30 most relevant keywords"],
                                "industries": ["inferred industries"],
                                "seniority": ["junior", "mid", "senior", "executive"],
                                "departments": ["inferred departments"],
                                "confidence": 0.95
                            }
                            
                            Rules:
                            - Extract names from email addresses, job titles, or other context
                            - Filter keywords to remove generic/navigation words
                            - Infer industries from job titles and company names
                            - Assign seniority levels based on job titles
                            - Return only valid JSON, no markdown`
                        },
                        {
                            role: 'user',
                            content: `Process this contact data: ${JSON.stringify(data)}`
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.1
                })
            });

            if (!openRouterResponse.ok) {
                console.warn('AI categorization failed, using original data');
                return data;
            }

            const aiResult = await openRouterResponse.json();
            const aiContent = aiResult.choices?.[0]?.message?.content;
            if (!aiContent) {
                return data;
            }
            
            try {
                let cleanContent = aiContent.trim();
                if (cleanContent.startsWith('```json')) {
                    cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
                } else if (cleanContent.startsWith('```')) {
                    cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
                }
                
                const aiData = JSON.parse(cleanContent);
                const enhancedData = { ...data };
                
                // Merge AI-generated names
                if (aiData.names && Array.isArray(aiData.names)) {
                    enhancedData.names = [...new Set([...(data.names || []), ...aiData.names])];
                }
                
                // Merge AI-filtered keywords
                if (aiData.keywords && Array.isArray(aiData.keywords)) {
                    enhancedData.keywords = aiData.keywords.slice(0, 30);
                }
                
                // Merge other AI data
                if (aiData.industries) enhancedData.industries = aiData.industries;
                if (aiData.seniority) enhancedData.seniority = aiData.seniority;
                if (aiData.departments) enhancedData.departments = aiData.departments;
                if (aiData.confidence) enhancedData.confidence = aiData.confidence;
                
                return enhancedData;
            } catch (parseError) {
                console.warn('Failed to parse AI response, using original data');
                console.warn('AI Response was:', aiContent);
                return data;
            }
        } catch (error) {
            console.warn('AI categorization error:', error.message);
            return data;
        }
    }

    // Clean name
    cleanName(name) {
        return name.trim().replace(/\s+/g, ' ');
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

    // Extract names from text content using smart context analysis
    extractNamesFromText(text) {
        return this.extractNamesWithContext(text);
    }

    // Extract social media profiles from text content
    extractSocialMediaFromText(text) {
        const socialMedia = {};
        const patterns = this.getSocialMediaPatterns();

        Object.keys(patterns).forEach(platform => {
            const matches = text.match(patterns[platform]);
            if (matches) {
                socialMedia[platform] = [...new Set(matches)];
            }
        });

        return socialMedia;
    }

    // Extract addresses from text content
    extractAddressesFromText(text) {
        const addresses = new Set();
        const patterns = this.getAddressPatterns();

        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    addresses.add(match.trim());
                });
            }
        });

        return Array.from(addresses);
    }

    // Extract personal data from HTML elements
    extractPersonalDataFromHTML($) {
        const personalData = {
            keywords: new Set(),
            addresses: new Set(),
            socialMedia: {},
            jobTitles: new Set(),
            companies: new Set()
        };

        // Extract from name elements with enhanced context
        $('[class*="name"], [class*="author"], [class*="person"], [id*="name"], [id*="author"], [id*="person"], [class*="contact"], [class*="team"], [class*="staff"]').each((i, el) => {
            const text = $(el).text();
            const names = this.extractNamesWithContext(text);
            names.forEach(name => personalData.keywords.add(name));
        });

        // Extract from address elements
        $('[class*="address"], [class*="location"], [id*="address"], [id*="location"]').each((i, el) => {
            const text = $(el).text();
            const addresses = this.extractAddressesFromText(text);
            addresses.forEach(address => personalData.addresses.add(address));
        });

        // Extract from social media links
        $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="facebook.com"], a[href*="instagram.com"], a[href*="youtube.com"]').each((i, el) => {
            const href = $(el).attr('href');
            const socialMedia = this.extractSocialMediaFromText(href);
            Object.keys(socialMedia).forEach(platform => {
                if (!personalData.socialMedia[platform]) {
                    personalData.socialMedia[platform] = new Set();
                }
                socialMedia[platform].forEach(profile => personalData.socialMedia[platform].add(profile));
            });
        });

        // Extract job titles and companies with enhanced patterns
        $('[class*="title"], [class*="position"], [class*="job"], [class*="company"], [class*="organization"], [class*="role"]').each((i, el) => {
            const text = $(el).text();
            // Enhanced patterns for job titles and companies
            const titleMatch = text.match(/\b(CEO|CTO|CFO|COO|VP|Director|Manager|Lead|Senior|Junior|Developer|Engineer|Designer|Analyst|Consultant|Specialist|Coordinator|Assistant|Intern|Founder|Co-founder|President|Executive|Head|Chief|Officer|Coordinator|Supervisor|Team Lead|Project Manager|Product Manager|Marketing Manager|Sales Manager|HR Manager|Operations Manager|Business Analyst|Data Analyst|UX Designer|UI Designer|Frontend|Backend|Full Stack|DevOps|QA|Tester|Architect|Consultant|Advisor|Mentor|Coach|Trainer|Instructor|Professor|Teacher|Lecturer|Researcher|Scientist|Doctor|Physician|Nurse|Therapist|Counselor|Lawyer|Attorney|Accountant|Bookkeeper|Receptionist|Administrator|Secretary|Assistant|Intern|Volunteer|Freelancer|Contractor|Consultant)\b/gi);
            if (titleMatch) {
                titleMatch.forEach(title => personalData.jobTitles.add(title.trim()));
            }
        });

        // Convert Sets to Arrays
        return {
            keywords: Array.from(personalData.keywords),
            addresses: Array.from(personalData.addresses),
            socialMedia: Object.keys(personalData.socialMedia).reduce((acc, platform) => {
                acc[platform] = Array.from(personalData.socialMedia[platform]);
                return acc;
            }, {}),
            jobTitles: Array.from(personalData.jobTitles),
            companies: Array.from(personalData.companies)
        };
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

    // Add this helper method
    shouldVisitUrl(url) {
        if (this.options.restrictToPath && this.options.restrictToPath.length > 0) {
            // More precise matching: URL should start with the restricted path
            // and either be exactly the same or have a '/' after the restricted path
            const restrictedPath = this.options.restrictToPath;
            const shouldVisit = url === restrictedPath || 
                               url.startsWith(restrictedPath + '/') ||
                               url.startsWith(restrictedPath + '?') ||
                               url.startsWith(restrictedPath + '#');
            
            if (!shouldVisit && this.options.onProgress) {
                this.options.onProgress({
                    type: 'url_filtered',
                    url: url,
                    reason: `Does not match restricted path: ${this.options.restrictToPath}`
                });
            }
            return shouldVisit;
        }
        return true;
    }

    // Scrape a single page
    async scrapePage(url, depth = 0) {
        if (!this.shouldVisitUrl(url)) {
            if (this.options.onProgress) {
                this.options.onProgress({ type: 'skipped', url, reason: 'Does not match restrictToPath' });
            }
            return { emails: [], personalData: {} };
        }

        if (depth > this.options.maxDepth || this.visitedUrls.size >= this.options.maxPages) {
            return { emails: [], links: [], personalData: {} };
        }

        if (this.visitedUrls.has(url)) {
            return { emails: [], links: [], personalData: {} };
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
                return { emails: [], links: [], personalData: {} };
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

            // Extract personal data if enabled
            let personalData = {};
            if (this.options.collectPersonalData) {
                personalData = this.extractPersonalDataFromHTML($);
                
                // Also extract from page text
                const textNames = this.extractNamesWithContext(pageText);
                const textSocialMedia = this.extractSocialMediaFromText(pageText);
                const textAddresses = this.extractAddressesFromText(pageText);

                // Extract names from email addresses
                const emailNames = [];
                allEmails.forEach(email => {
                    const extractedName = this.extractNamesFromEmail(email);
                    if (extractedName) {
                        emailNames.push(extractedName);
                    }
                });

                // Merge with HTML data
                personalData.keywords = [...new Set([...personalData.keywords, ...textNames])];
                personalData.names = [...new Set([...emailNames, ...textNames])]; // Combine email names and extracted names
                personalData.addresses = [...new Set([...personalData.addresses, ...textAddresses])];

                // Merge social media
                Object.keys(textSocialMedia).forEach(platform => {
                    if (!personalData.socialMedia[platform]) {
                        personalData.socialMedia[platform] = [];
                    }
                    personalData.socialMedia[platform] = [...new Set([...personalData.socialMedia[platform], ...textSocialMedia[platform]])];
                });

                // Apply AI categorization if enabled
                if (this.options.useAICategorization && Object.keys(personalData).length > 0) {
                    try {
                        personalData = await this.categorizeDataWithAI(personalData);
                    } catch (error) {
                        console.warn('AI categorization failed:', error.message);
                    }
                }
            }

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
                            // Only add links that match the restricted path (if specified)
                            if (this.shouldVisitUrl(absoluteUrl)) {
                                links.push(absoluteUrl);
                            }
                        }
                    } catch (error) {
                        // Skip invalid URLs
                    }
                }
            });

            // Add emails to global set
            allEmails.forEach(email => this.emails.add(email));

            // Store personal data with emails as keys
            if (this.options.collectPersonalData && allEmails.length > 0) {
                allEmails.forEach(email => {
                    if (!this.personalData.has(email)) {
                        this.personalData.set(email, {
                            names: [],
                            keywords: [],
                            addresses: [],
                            socialMedia: {},
                            jobTitles: [],
                            companies: [],
                            industries: [],
                            seniority: [],
                            departments: [],
                            confidence: 0,
                            sourceUrl: url
                        });
                    }
                    
                    const existingData = this.personalData.get(email);
                    // Merge new data with existing data
                    existingData.names = [...new Set([...existingData.names, ...(personalData.names || [])])];
                    existingData.keywords = [...new Set([...existingData.keywords, ...personalData.keywords])];
                    existingData.addresses = [...new Set([...existingData.addresses, ...personalData.addresses])];
                    existingData.jobTitles = [...new Set([...existingData.jobTitles, ...personalData.jobTitles])];
                    existingData.companies = [...new Set([...existingData.companies, ...personalData.companies])];
                    
                    // Merge AI-categorized data if available
                    if (personalData.industries) {
                        existingData.industries = [...new Set([...existingData.industries, ...personalData.industries])];
                    }
                    if (personalData.seniority) {
                        existingData.seniority = [...new Set([...existingData.seniority, ...personalData.seniority])];
                    }
                    if (personalData.departments) {
                        existingData.departments = [...new Set([...existingData.departments, ...personalData.departments])];
                    }
                    if (personalData.confidence) {
                        existingData.confidence = Math.max(existingData.confidence, personalData.confidence);
                    }
                    
                    // Merge social media
                    Object.keys(personalData.socialMedia).forEach(platform => {
                        if (!existingData.socialMedia[platform]) {
                            existingData.socialMedia[platform] = [];
                        }
                        existingData.socialMedia[platform] = [...new Set([...existingData.socialMedia[platform], ...personalData.socialMedia[platform]])];
                    });
                });
            }

            // Call progress callback for emails found
            if (this.options.onProgress && allEmails.length > 0) {
                this.options.onProgress({
                    type: 'emails_found',
                    url: url,
                    emails: allEmails,
                    totalEmails: this.emails.size,
                    personalData: this.options.collectPersonalData ? personalData : null
                });
            }

            // Call progress callback for page completion
            if (this.options.onProgress) {
                this.options.onProgress({
                    type: 'page_complete',
                    url: url,
                    emailsFound: allEmails.length,
                    pagesVisited: this.visitedUrls.size,
                    totalEmails: this.emails.size,
                    personalDataFound: this.options.collectPersonalData ? Object.keys(personalData).length : 0
                });
            }

            console.log(`Found ${allEmails.length} emails on ${url}`);
            if (this.options.collectPersonalData) {
                console.log(`Found personal data: ${personalData.keywords.length} keywords, ${personalData.addresses.length} addresses, ${Object.keys(personalData.socialMedia).length} social platforms`);
                if (this.options.useAICategorization) {
                    console.log(`AI categorization: ${personalData.industries?.length || 0} industries, ${personalData.seniority?.length || 0} seniority levels, ${personalData.departments?.length || 0} departments`);
                }
            }
            
            return { emails: allEmails, links: [...new Set(links)], personalData };

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
            
            return { emails: [], links: [], personalData: {} };
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
            
            if (!this.shouldVisitUrl(url)) {
                if (this.options.onProgress) {
                    this.options.onProgress({ type: 'skipped', url, reason: 'Does not match restrictToPath' });
                }
                continue;
            }
            
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
        if (this.options.collectPersonalData) {
            console.log(`Personal data collection: ENABLED`);
            if (this.options.useAICategorization) {
                console.log(`AI categorization: ENABLED (using Google Gemini Flash via OpenRouter)`);
            }
        }

        try {
            await this.initBrowser();
            await this.scrapeRecursive([startUrl], 0);
            
            const emails = Array.from(this.emails);
            
            console.log(`\nScraping completed!`);
            console.log(`Total pages visited: ${this.visitedUrls.size}`);
            console.log(`Total unique emails found: ${emails.length}`);
            
            if (this.options.collectPersonalData) {
                console.log(`Personal data collected for ${this.personalData.size} email addresses`);
            }
            
            return {
                emails,
                pagesVisited: this.visitedUrls.size,
                totalEmails: emails.length,
                personalData: this.options.collectPersonalData ? Object.fromEntries(this.personalData) : null
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