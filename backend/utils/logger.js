/**
 * ============================================
 * Logger Utility
 * Made by Hammad Naeem
 * ============================================
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Format log message
 */
function formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
        if (typeof data === 'object') {
            logMessage += ` ${JSON.stringify(data)}`;
        } else {
            logMessage += ` ${data}`;
        }
    }
    
    return logMessage;
}

/**
 * Write to log file
 */
function writeToFile(message) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `app-${date}.log`);
    
    fs.appendFileSync(logFile, message + '\n');
}

/**
 * Logger object
 */
const logger = {
    error: (message, data = null) => {
        if (currentLevel >= LOG_LEVELS.ERROR) {
            const formatted = formatMessage('ERROR', message, data);
            console.error('\x1b[31m%s\x1b[0m', formatted);
            writeToFile(formatted);
        }
    },

    warn: (message, data = null) => {
        if (currentLevel >= LOG_LEVELS.WARN) {
            const formatted = formatMessage('WARN', message, data);
            console.warn('\x1b[33m%s\x1b[0m', formatted);
            writeToFile(formatted);
        }
    },

    info: (message, data = null) => {
        if (currentLevel >= LOG_LEVELS.INFO) {
            const formatted = formatMessage('INFO', message, data);
            console.info('\x1b[36m%s\x1b[0m', formatted);
            writeToFile(formatted);
        }
    },

    debug: (message, data = null) => {
        if (currentLevel >= LOG_LEVELS.DEBUG) {
            const formatted = formatMessage('DEBUG', message, data);
            console.log('\x1b[90m%s\x1b[0m', formatted);
        }
    },

    success: (message, data = null) => {
        const formatted = formatMessage('SUCCESS', message, data);
        console.log('\x1b[32m%s\x1b[0m', formatted);
        writeToFile(formatted);
    }
};

module.exports = logger;