/**
 * ============================================
 * Formatting Utilities
 * Made by Hammad Naeem
 * ============================================
 */

/**
 * Format number as Pakistani Rupees
 */
export function formatCurrency(amount, showSymbol = true) {
    if (amount === null || amount === undefined) return '-';
    
    const formatted = new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
    
    return showSymbol ? `Rs. ${formatted}` : formatted;
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format date
 */
export function formatDate(date, format = 'full') {
    if (!date) return '-';
    
    const d = new Date(date);
    
    const formats = {
        full: d.toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        short: d.toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        date: d.toLocaleDateString('en-PK'),
        time: d.toLocaleTimeString('en-PK', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        datetime: d.toLocaleString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        relative: getRelativeTime(d)
    };
    
    return formats[format] || formats.full;
}

/**
 * Get relative time string
 */
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined) return '-';
    return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Get change indicator
 */
export function getChangeIndicator(value) {
    if (value > 0) return { type: 'positive', symbol: '↑' };
    if (value < 0) return { type: 'negative', symbol: '↓' };
    return { type: 'neutral', symbol: '→' };
}

/**
 * Truncate text
 */
export function truncate(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

export default {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    getChangeIndicator,
    truncate
};