/**
 * ============================================
 * Role-Based Access Control (RBAC) Middleware
 * Made by Hammad Naeem
 * ============================================
 */

const logger = require('../utils/logger');

/**
 * Check if user has required permission
 * @param {string|string[]} requiredPermissions - Required permission(s)
 */
function requirePermission(requiredPermissions) {
    const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const userPermissions = req.user.permissions || [];

        // Check if user has any of the required permissions
        const hasPermission = permissions.some(permission => 
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            logger.warn(`Access denied for user ${req.user.email}. Required: ${permissions.join(', ')}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
}

/**
 * Check if user has specific role
 * @param {string|string[]} allowedRoles - Allowed role(s)
 */
function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.roleName)) {
            logger.warn(`Role access denied for user ${req.user.email}. Required: ${roles.join(', ')}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Role not authorized.'
            });
        }

        next();
    };
}

/**
 * Admin only middleware
 */
function adminOnly(req, res, next) {
    return requireRole('Admin')(req, res, next);
}

/**
 * Manager or Admin middleware
 */
function managerOrAdmin(req, res, next) {
    return requireRole(['Admin', 'Manager'])(req, res, next);
}

/**
 * Any authenticated user
 */
function anyAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }
    next();
}

module.exports = {
    requirePermission,
    requireRole,
    adminOnly,
    managerOrAdmin,
    anyAuthenticated
};