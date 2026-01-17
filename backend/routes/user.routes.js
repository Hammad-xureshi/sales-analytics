/**
 * ============================================
 * User Management Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly, requirePermission } = require('../middleware/rbac');
const { paginationValidators, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', adminOnly, paginationValidators, userController.getAllUsers);
router.get('/roles', adminOnly, userController.getAllRoles);
router.get('/:id', adminOnly, idParamValidator, userController.getUserById);
router.post('/', adminOnly, userController.createUser);
router.put('/:id', adminOnly, idParamValidator, userController.updateUser);
router.delete('/:id', adminOnly, idParamValidator, userController.deleteUser);
router.patch('/:id/toggle-status', adminOnly, idParamValidator, userController.toggleUserStatus);

module.exports = router;