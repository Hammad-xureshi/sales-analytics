/**
 * ============================================
 * User Management Controller
 * Made by Hammad Naeem
 * ============================================
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');
const config = require('../config/config');
const logger = require('../utils/logger');
const { parsePagination, getPaginationMeta } = require('../utils/helpers');

/**
 * Get all users with pagination
 */
async function getAllUsers(req, res, next) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const { search, role, status } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (role) {
            whereClause += ` AND r.name = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        if (status === 'active') {
            whereClause += ' AND u.is_active = true';
        } else if (status === 'inactive') {
            whereClause += ' AND u.is_active = false';
        }

        // Get total count
        const countResult = await db.query(`
            SELECT COUNT(*) FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ${whereClause}
        `, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get users
        const result = await db.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                   u.last_login, u.created_at, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...params, limit, offset]);

        res.json({
            success: true,
            data: result.rows.map(user => ({
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role_name,
                isActive: user.is_active,
                lastLogin: user.last_login,
                createdAt: user.created_at
            })),
            pagination: getPaginationMeta(page, limit, totalCount)
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get all roles
 */
async function getAllRoles(req, res, next) {
    try {
        const result = await db.query(`
            SELECT id, name, description, permissions, created_at
            FROM roles
            ORDER BY id
        `);

        res.json({
            success: true,
            data: result.rows.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: role.permissions,
                createdAt: role.created_at
            }))
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get user by ID
 */
async function getUserById(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                   u.last_login, u.created_at, u.updated_at,
                   r.id as role_id, r.name as role_name, r.permissions
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                roleId: user.role_id,
                role: user.role_name,
                permissions: user.permissions,
                isActive: user.is_active,
                lastLogin: user.last_login,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Create new user
 */
async function createUser(req, res, next) {
    try {
        const { email, password, firstName, lastName, roleId } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, first name, and last name are required'
            });
        }

        // Check if email exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

        // Create user
        const result = await db.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name, last_name, created_at
        `, [email.toLowerCase(), hashedPassword, firstName, lastName, roleId || 3]);

        logger.info(`User created by admin: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                createdAt: result.rows[0].created_at
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update user
 */
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { email, firstName, lastName, roleId, isActive } = req.body;

        // Check user exists
        const existingUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check email uniqueness if changing
        if (email) {
            const emailCheck = await db.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email.toLowerCase(), id]
            );
            if (emailCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        const result = await db.query(`
            UPDATE users
            SET email = COALESCE($1, email),
                first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name),
                role_id = COALESCE($4, role_id),
                is_active = COALESCE($5, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, email, first_name, last_name, is_active
        `, [email?.toLowerCase(), firstName, lastName, roleId, isActive, id]);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Delete user
 */
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;

        // Prevent deleting own account
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING email',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`User deleted: ${result.rows[0].email}`);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Toggle user active status
 */
async function toggleUserStatus(req, res, next) {
    try {
        const { id } = req.params;

        // Prevent deactivating own account
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }

        const result = await db.query(`
            UPDATE users
            SET is_active = NOT is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, email, is_active
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    getAllRoles,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
};