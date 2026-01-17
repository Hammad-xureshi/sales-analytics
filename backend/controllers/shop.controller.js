/**
 * ============================================
 * Shop/Branch Controller
 * Made by Hammad Naeem
 * ============================================
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { parsePagination, getPaginationMeta } = require('../utils/helpers');

/**
 * Get all shops
 */
async function getAllShops(req, res, next) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const { websiteId, city } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (websiteId) {
            whereClause += ` AND s.website_id = $${paramIndex}`;
            params.push(websiteId);
            paramIndex++;
        }

        if (city) {
            whereClause += ` AND s.city ILIKE $${paramIndex}`;
            params.push(`%${city}%`);
            paramIndex++;
        }

        const countResult = await db.query(
            `SELECT COUNT(*) FROM shops s ${whereClause}`,
            params
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(`
            SELECT s.*, w.name as website_name,
                   (SELECT COUNT(*) FROM sales WHERE shop_id = s.id) as total_sales,
                   (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE shop_id = s.id) as total_revenue
            FROM shops s
            LEFT JOIN websites w ON s.website_id = w.id
            ${whereClause}
            ORDER BY s.name
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...params, limit, offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: getPaginationMeta(page, limit, totalCount)
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get shop by ID
 */
async function getShopById(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT s.*, w.name as website_name
            FROM shops s
            LEFT JOIN websites w ON s.website_id = w.id
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get shop statistics
 */
async function getShopStats(req, res, next) {
    try {
        const { id } = req.params;

        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value,
                COUNT(DISTINCT customer_id) as unique_customers
            FROM sales
            WHERE shop_id = $1
        `, [id]);

        const todayResult = await db.query(`
            SELECT 
                COUNT(*) as today_sales,
                COALESCE(SUM(total_amount), 0) as today_revenue
            FROM sales
            WHERE shop_id = $1 AND sale_date::DATE = CURRENT_DATE
        `, [id]);

        res.json({
            success: true,
            data: {
                allTime: statsResult.rows[0],
                today: todayResult.rows[0]
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Create shop
 */
async function createShop(req, res, next) {
    try {
        const { websiteId, name, location, city, country, managerName, contactPhone, contactEmail } = req.body;

        if (!websiteId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Website ID and shop name are required'
            });
        }

        const result = await db.query(`
            INSERT INTO shops (website_id, name, location, city, country, manager_name, contact_phone, contact_email)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [websiteId, name, location, city, country || 'Pakistan', managerName, contactPhone, contactEmail]);

        logger.info(`Shop created: ${name}`);

        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update shop
 */
async function updateShop(req, res, next) {
    try {
        const { id } = req.params;
        const { name, location, city, country, managerName, contactPhone, contactEmail, isActive } = req.body;

        const result = await db.query(`
            UPDATE shops
            SET name = COALESCE($1, name),
                location = COALESCE($2, location),
                city = COALESCE($3, city),
                country = COALESCE($4, country),
                manager_name = COALESCE($5, manager_name),
                contact_phone = COALESCE($6, contact_phone),
                contact_email = COALESCE($7, contact_email),
                is_active = COALESCE($8, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *
        `, [name, location, city, country, managerName, contactPhone, contactEmail, isActive, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        res.json({
            success: true,
            message: 'Shop updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Delete shop
 */
async function deleteShop(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM shops WHERE id = $1 RETURNING name',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        logger.info(`Shop deleted: ${result.rows[0].name}`);

        res.json({
            success: true,
            message: 'Shop deleted successfully'
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllShops,
    getShopById,
    getShopStats,
    createShop,
    updateShop,
    deleteShop
};