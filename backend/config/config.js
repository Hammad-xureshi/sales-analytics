/**
 * ============================================
 * Application Configuration
 * Made by Hammad Naeem
 * ============================================
 */

require('dotenv').config({ path: '../.env' });

const config = {
    // Server configuration
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'sales_analytics_erp',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Security configuration
    bcrypt: {
        saltRounds: 12
    },

    // Pagination defaults
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    }
};

module.exports = config;