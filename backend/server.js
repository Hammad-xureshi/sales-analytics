/**
 * ============================================
 * Sales Analytics ERP System - Backend Server
 * Made by Hammad Naeem
 * ============================================
 * 
 * Main entry point for the Node.js backend.
 * Handles API routing, middleware setup, and server initialization.
 */

require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');

const config = require('./config/config');
const { initializeDatabase } = require('./database/init');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const websiteRoutes = require('./routes/website.routes');
const shopRoutes = require('./routes/shop.routes');
const productRoutes = require('./routes/product.routes');
const saleRoutes = require('./routes/sale.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIO(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Make io instance globally accessible
global.io = io;

// ============================================
// Socket.io Connection Handling
// ============================================

io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Join dashboard room for broadcast alerts
    socket.on('join_dashboard', () => {
        socket.join('dashboard');
        logger.info(`📊 Client ${socket.id} joined dashboard room`);
    });

    socket.on('leave_dashboard', () => {
        socket.leave('dashboard');
        logger.info(`📊 Client ${socket.id} left dashboard room`);
    });

    socket.on('disconnect', () => {
        logger.info(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
    });
});

// ============================================
// Middleware Setup
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration for offline/local development
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Sales Analytics ERP Backend',
        author: 'Hammad Naeem'
    });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================

async function startServer() {
    try {
        logger.info('============================================');
        logger.info('Sales Analytics ERP System');
        logger.info('Made by Hammad Naeem');
        logger.info('============================================');

        // Test database connection first
        logger.info('Testing database connection...');
        const db = require('./config/database');
        const isConnected = await db.testConnection();

        if (!isConnected) {
            logger.error('❌ Database connection failed!');
            logger.error('Please verify:');
            logger.error('  1. PostgreSQL is running');
            logger.error('  2. DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env are correct');
            logger.error('  3. Database "' + process.env.DB_NAME + '" exists');
            logger.error('\nServer will start but API calls will fail.');
        } else {
            // Initialize database if connected
            try {
                logger.info('Initializing database schema...');
                const { initializeDatabase } = require('./database/init');
                await initializeDatabase();
                logger.info('✅ Database initialized successfully!');
            } catch (initError) {
                logger.warn('Database initialization failed:', initError.message);
                logger.warn('Continuing with server startup...');
            }
        }

        // Start HTTP server with Socket.io
        const PORT = config.port || 5000;
        server.listen(PORT, () => {
            logger.info(`\n✅ Server running on http://localhost:${PORT}`);
            logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
            logger.info(`🔌 WebSocket ready on ws://localhost:${PORT}`);
            logger.info('============================================\n');
        });

    } catch (error) {
        logger.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;