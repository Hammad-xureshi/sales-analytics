/**
 * ============================================
 * Website Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/website.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly, managerOrAdmin } = require('../middleware/rbac');
const { paginationValidators, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Read routes - all authenticated users
router.get('/', paginationValidators, websiteController.getAllWebsites);
router.get('/:id', idParamValidator, websiteController.getWebsiteById);
router.get('/:id/products', idParamValidator, websiteController.getWebsiteProducts);
router.get('/:id/shops', idParamValidator, websiteController.getWebsiteShops);
router.get('/:id/stats', idParamValidator, websiteController.getWebsiteStats);

// Write routes - admin only
router.post('/', adminOnly, websiteController.createWebsite);
router.put('/:id', adminOnly, idParamValidator, websiteController.updateWebsite);
router.delete('/:id', adminOnly, idParamValidator, websiteController.deleteWebsite);

module.exports = router;