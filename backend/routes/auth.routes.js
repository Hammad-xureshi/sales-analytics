/**
 * ============================================
 * Authentication Routes
 * Made by Hammad Naeem
 * ============================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authValidators } = require('../utils/validators');

// Public routes
router.post('/login', authValidators.login, authController.login);
router.post('/register', authValidators.register, authController.register);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

module.exports = router;