/**
 * ============================================
 * Helper Utilities
 * Made by Hammad Naeem
 * ============================================
 */

/**
 * Generate pagination metadata
 */
function getPaginationMeta(page, limit, totalCount) {
    const totalPages = Math.ceil(totalCount / limit);
    return {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
}

/**
 * Parse pagination params from request
 */
function parsePagination(req, defaultLimit = 20, maxLimit = 100) {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;

    if (page < 1) page = 1;
    if (limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

/**
 * Format currency for Pakistan
 */
function formatCurrency(amount, currency = 'PKR') {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Generate random string
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Sanitize object - remove undefined and null values
 */
function sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null && value !== '') {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * Calculate percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
}

/**
 * Get date range for analytics
 */
function getDateRange(period) {
    const now = new Date();
    const ranges = {
        today: {
            start: new Date(now.setHours(0, 0, 0, 0)),
            end: new Date()
        },
        yesterday: {
            start: new Date(new Date().setDate(now.getDate() - 1)),
            end: new Date(new Date().setDate(now.getDate() - 1))
        },
        week: {
            start: new Date(new Date().setDate(now.getDate() - 7)),
            end: new Date()
        },
        month: {
            start: new Date(new Date().setDate(now.getDate() - 30)),
            end: new Date()
        },
        quarter: {
            start: new Date(new Date().setDate(now.getDate() - 90)),
            end: new Date()
        },
        year: {
            start: new Date(new Date().setFullYear(now.getFullYear() - 1)),
            end: new Date()
        }
    };

    return ranges[period] || ranges.month;
}

module.exports = {
    getPaginationMeta,
    parsePagination,
    formatCurrency,
    generateRandomString,
    sanitizeObject,
    calculatePercentageChange,
    getDateRange
};