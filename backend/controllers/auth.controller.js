/**
 * ============================================
 * Authentication Controller
 * Made by Hammad Naeem
 * ============================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * User login
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        logger.info(`Login attempt: ${email}`);

        // Find user with role
        let result;
        try {
            result = await db.query(`
                SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, 
                       u.is_active, r.id as role_id, r.name as role_name, r.permissions
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.email = $1
            `, [email.toLowerCase()]);
        } catch (dbError) {
            logger.error('Database query failed during login:', {
                error: dbError.message,
                code: dbError.code,
                email: email
            });

            if (dbError.code === '28P01') {
                return res.status(500).json({
                    success: false,
                    message: 'Database authentication failed. Check server configuration.'
                });
            }

            if (dbError.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    success: false,
                    message: 'Database connection unavailable. Please try again later.'
                });
            }

            throw dbError;
        }

        if (result.rows.length === 0) {
            logger.warn(`Login failed: User not found - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            logger.warn(`Login failed: Account inactive - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact administrator.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            logger.warn(`Login failed: Invalid password - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        try {
            await db.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
        } catch (updateError) {
            logger.warn('Could not update last_login:', updateError.message);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role_name },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Log login (non-critical)
        try {
            await db.query(`
                INSERT INTO audit_logs (table_name, record_id, action, user_id, user_email)
                VALUES ('users', $1, 'LOGIN', $1, $2)
            `, [user.id, user.email]);
        } catch (auditError) {
            logger.warn('Could not log login audit:', auditError.message);
        }

        logger.info(`✅ User logged in successfully: ${user.email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role_name,
                    permissions: user.permissions || []
                }
            }
        });

    } catch (error) {
        logger.error('Login error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        next(error);
    }
}

/**
 * User registration (Admin creates users)
 */
async function register(req, res, next) {
    try {
        const { email, password, firstName, lastName, roleId } = req.body;

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

        // Get default role (Viewer) if not specified
        let userRoleId = roleId;
        if (!userRoleId) {
            const roleResult = await db.query(
                "SELECT id FROM roles WHERE name = 'Viewer'"
            );
            userRoleId = roleResult.rows[0]?.id;
        }

        // Create user
        const result = await db.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name, last_name
        `, [email.toLowerCase(), hashedPassword, firstName, lastName, userRoleId]);

        const newUser = result.rows[0];

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get current user profile
 */
async function getProfile(req, res, next) {
    try {
        const result = await db.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, 
                   u.last_login, u.created_at,
                   r.name as role_name, r.permissions
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [req.user.id]);

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
                role: user.role_name,
                permissions: user.permissions || [],
                lastLogin: user.last_login,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update current user profile
 */
async function updateProfile(req, res, next) {
    try {
        const { firstName, lastName } = req.body;

        const result = await db.query(`
            UPDATE users 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, email, first_name, last_name
        `, [firstName, lastName, req.user.id]);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Change password
 */
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        // Get current password hash
        const userResult = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        const user = userResult.rows[0];

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        logger.info(`Password changed for user: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Logout (client-side token removal, server logs action)
 */
async function logout(req, res, next) {
    try {
        await db.query(`
            INSERT INTO audit_logs (table_name, record_id, action, user_id, user_email)
            VALUES ('users', $1, 'LOGOUT', $1, $2)
        `, [req.user.id, req.user.email]);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
    logout
};