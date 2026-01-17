/**
 * ============================================
 * Shop/Branch Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');
const { paginationValidators, idParamValidator } = require('../utils/validators');

router.use(authenticate);

router.get('/', paginationValidators, shopController.getAllShops);
router.get('/:id', idParamValidator, shopController.getShopById);
router.get('/:id/stats', idParamValidator, shopController.getShopStats);

router.post('/', adminOnly, shopController.createShop);
router.put('/:id', adminOnly, idParamValidator, shopController.updateShop);
router.delete('/:id', adminOnly, idParamValidator, shopController.deleteShop);

module.exports = router;