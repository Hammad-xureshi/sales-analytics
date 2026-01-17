/**
 * ============================================
 * Product Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly, managerOrAdmin } = require('../middleware/rbac');
const { productValidators, paginationValidators, idParamValidator } = require('../utils/validators');

router.use(authenticate);

// Read routes
router.get('/', paginationValidators, productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', idParamValidator, productController.getProductById);

// Write routes
router.post('/', managerOrAdmin, productValidators.create, productController.createProduct);
router.put('/:id', managerOrAdmin, productValidators.update, productController.updateProduct);
router.delete('/:id', adminOnly, idParamValidator, productController.deleteProduct);
router.patch('/:id/stock', managerOrAdmin, idParamValidator, productController.updateStock);

module.exports = router;