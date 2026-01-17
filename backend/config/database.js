/**
 * ============================================
 * PostgreSQL Database Connection
 * Made by Hammad Naeem
 * ============================================
 */

const { Pool } = require('pg');
const config = require('./config');
const logger = require('../utils/logger');

// Create connection pool
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

pool.on('error', (err) => {
    logger.error('Unexpected database pool error:', err.message);
    if (err.code === 'ECONNREFUSED') {
        logger.error('PostgreSQL server is not running. Please start PostgreSQL.');
    } else if (err.code === '28P01') {
        logger.error('PostgreSQL authentication failed. Check DB_PASSWORD in .env');
    }
});

pool.on('connect', () => {
    logger.debug('New database connection established');
    reconnectAttempts = 0;
});

/**
 * Execute a query with parameters
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug(`Query executed in ${duration}ms`);
        return result;
    } catch (error) {
        logger.error('Database query error:', { 
            query: text.substring(0, 100),
            error: error.message,
            code: error.code 
        });
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
    try {
        const client = await pool.connect();
        const originalRelease = client.release.bind(client);
        
        client.release = () => {
            logger.debug('Database client released');
            return originalRelease();
        };
        
        return client;
    } catch (error) {
        logger.error('Failed to get database client:', error.message);
        if (error.code === '28P01') {
            throw new Error('Database authentication failed. Check PostgreSQL credentials.');
        }
        throw error;
    }
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const result = await query('SELECT NOW() as current_time');
        logger.info(`✅ Database connected at ${result.rows[0].current_time}`);
        return true;
    } catch (error) {
        logger.error('❌ Database connection test failed:', error.message);
        if (error.code === '28P01') {
            logger.error('Authentication Error: Check DB_PASSWORD in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            logger.error('Connection Error: PostgreSQL is not running');
        }
        return false;
    }
}

/**
 * Execute a transaction
 */
async function transaction(callback) {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Close all pool connections
 */
async function closePool() {
    await pool.end();
    logger.info('Database pool closed');
}

module.exports = {
    query,
    getClient,
    transaction,
    testConnection,
    closePool,
    pool
};