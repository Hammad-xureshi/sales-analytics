/**
 * ============================================
 * Sales Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { authenticate } = require('../middleware/auth');
const { managerOrAdmin, requirePermission } = require('../middleware/rbac');
const { saleValidators, paginationValidators, idParamValidator } = require('../utils/validators');

router.use(authenticate);

// Read routes
router.get('/', paginationValidators, saleController.getAllSales);
router.get('/recent', saleController.getRecentSales);
router.get('/today', saleController.getTodaySales);
router.get('/:id', idParamValidator, saleController.getSaleById);
router.get('/:id/items', idParamValidator, saleController.getSaleItems);

// Write routes
router.post('/', managerOrAdmin, saleValidators.create, saleController.createSale);
router.put('/:id/status', managerOrAdmin, idParamValidator, saleController.updateSaleStatus);

module.exports = router;