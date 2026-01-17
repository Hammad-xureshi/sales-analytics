/**
 * ============================================
 * Input Validators
 * Made by Hammad Naeem
 * ============================================
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
}

/**
 * Auth validators
 */
const authValidators = {
    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        handleValidation
    ],

    register: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('firstName')
            .trim()
            .notEmpty()
            .withMessage('First name is required')
            .isLength({ max: 100 })
            .withMessage('First name too long'),
        body('lastName')
            .trim()
            .notEmpty()
            .withMessage('Last name is required')
            .isLength({ max: 100 })
            .withMessage('Last name too long'),
        handleValidation
    ]
};

/**
 * Sale validators
 */
const saleValidators = {
    create: [
        body('websiteId')
            .isInt({ min: 1 })
            .withMessage('Valid website ID is required'),
        body('items')
            .isArray({ min: 1 })
            .withMessage('At least one item is required'),
        body('items.*.productId')
            .isInt({ min: 1 })
            .withMessage('Valid product ID is required'),
        body('items.*.quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be at least 1'),
        body('paymentMethod')
            .optional()
            .isIn(['cash', 'card', 'bank_transfer', 'online'])
            .withMessage('Invalid payment method'),
        handleValidation
    ]
};

/**
 * Product validators
 */
const productValidators = {
    create: [
        body('sku')
            .trim()
            .notEmpty()
            .withMessage('SKU is required')
            .isLength({ max: 100 })
            .withMessage('SKU too long'),
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Product name is required')
            .isLength({ max: 255 })
            .withMessage('Name too long'),
        body('unitPrice')
            .isFloat({ min: 0 })
            .withMessage('Valid unit price is required'),
        body('stockQuantity')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Stock quantity must be non-negative'),
        handleValidation
    ],

    update: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Valid product ID is required'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage('Name must be 1-255 characters'),
        body('unitPrice')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Unit price must be non-negative'),
        handleValidation
    ]
};

/**
 * Pagination validators
 */
const paginationValidators = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidation
];

/**
 * ID parameter validator
 */
const idParamValidator = [
    param('id')
        .notEmpty()
        .withMessage('ID is required'),
    handleValidation
];

module.exports = {
    handleValidation,
    authValidators,
    saleValidators,
    productValidators,
    paginationValidators,
    idParamValidator
};