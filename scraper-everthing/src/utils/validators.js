/**
 * URL validation utility
 */
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return { isValid: false, error: 'URL must be a non-empty string' };
    }

    try {
        const urlObj = new URL(url);
        
        // Check if protocol is http or https
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
        }

        // Check if hostname is present
        if (!urlObj.hostname) {
            return { isValid: false, error: 'URL must have a valid hostname' };
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: 'Invalid URL format' };
    }
}

/**
 * Scraping options validation
 */
function validateScrapingOptions(options) {
    if (!options || typeof options !== 'object') {
        return { isValid: true }; // Default options will be used
    }

    const errors = [];

    // Validate maxDepth
    if (options.maxDepth !== undefined) {
        if (!Number.isInteger(options.maxDepth) || options.maxDepth < 0 || options.maxDepth > 10) {
            errors.push('maxDepth must be an integer between 0 and 10');
        }
    }

    // Validate maxPages
    if (options.maxPages !== undefined) {
        if (!Number.isInteger(options.maxPages) || options.maxPages < 1 || options.maxPages > 1000) {
            errors.push('maxPages must be an integer between 1 and 1000');
        }
    }

    // Validate delay
    if (options.delay !== undefined) {
        if (!Number.isInteger(options.delay) || options.delay < 0 || options.delay > 10000) {
            errors.push('delay must be an integer between 0 and 10000 milliseconds');
        }
    }

    // Validate timeout
    if (options.timeout !== undefined) {
        if (!Number.isInteger(options.timeout) || options.timeout < 5000 || options.timeout > 120000) {
            errors.push('timeout must be an integer between 5000 and 120000 milliseconds');
        }
    }

    // Validate boolean options
    const booleanOptions = ['headless', 'respectRobots', 'skipImages', 'skipCSS', 'skipFonts', 'skipMedia'];
    booleanOptions.forEach(option => {
        if (options[option] !== undefined && typeof options[option] !== 'boolean') {
            errors.push(`${option} must be a boolean value`);
        }
    });

    if (errors.length > 0) {
        return { isValid: false, error: errors.join(', ') };
    }

    return { isValid: true };
}

/**
 * Batch URLs validation
 */
function validateBatchUrls(urls) {
    if (!Array.isArray(urls)) {
        return { isValid: false, error: 'URLs must be an array' };
    }

    if (urls.length === 0) {
        return { isValid: false, error: 'URLs array cannot be empty' };
    }

    if (urls.length > 10) {
        return { isValid: false, error: 'Maximum 10 URLs allowed per batch' };
    }

    const errors = [];
    urls.forEach((url, index) => {
        const validation = validateUrl(url);
        if (!validation.isValid) {
            errors.push(`URL ${index + 1}: ${validation.error}`);
        }
    });

    if (errors.length > 0) {
        return { isValid: false, error: errors.join('; ') };
    }

    return { isValid: true };
}

module.exports = {
    validateUrl,
    validateScrapingOptions,
    validateBatchUrls
}; 