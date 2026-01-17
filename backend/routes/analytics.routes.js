/**
 * ============================================
 * Analytics Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Dashboard overview
router.get('/dashboard', analyticsController.getDashboardStats);

// Sales analytics
router.get('/sales/summary', analyticsController.getSalesSummary);
router.get('/sales/hourly', analyticsController.getHourlySales);
router.get('/sales/daily', analyticsController.getDailySales);
router.get('/sales/monthly', analyticsController.getMonthlySales);

// Website analytics
router.get('/websites/comparison', analyticsController.getWebsiteComparison);
router.get('/websites/performance', analyticsController.getWebsitePerformance);

// Product analytics
router.get('/products/top-selling', analyticsController.getTopSellingProducts);
router.get('/products/category-breakdown', analyticsController.getCategoryBreakdown);

// Time-based analytics
router.get('/peak-hours', analyticsController.getPeakHours);
router.get('/trends', analyticsController.getSalesTrends);

// Real-time
router.get('/realtime/counter', analyticsController.getRealTimeCounter);

module.exports = router;