/**
 * ============================================
 * Website Controller
 * Made by Hammad Naeem
 * ============================================
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { parsePagination, getPaginationMeta } = require('../utils/helpers');

/**
 * Get all websites
 */
async function getAllWebsites(req, res, next) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const { category, status } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (status === 'active') {
            whereClause += ' AND is_active = true';
        } else if (status === 'inactive') {
            whereClause += ' AND is_active = false';
        }

        const countResult = await db.query(
            `SELECT COUNT(*) FROM websites ${whereClause}`,
            params
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(`
            SELECT w.*, 
                   (SELECT COUNT(*) FROM shops WHERE website_id = w.id) as shop_count,
                   (SELECT COUNT(*) FROM website_products WHERE website_id = w.id) as product_count,
                   (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE website_id = w.id AND sale_date::DATE = CURRENT_DATE) as today_revenue
            FROM websites w
            ${whereClause}
            ORDER BY w.created_at DESC
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
 * Get website by ID
 */
async function getWebsiteById(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT w.*,
                   (SELECT COUNT(*) FROM shops WHERE website_id = w.id) as shop_count,
                   (SELECT COUNT(*) FROM website_products WHERE website_id = w.id) as product_count
            FROM websites w
            WHERE w.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
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
 * Get website products
 */
async function getWebsiteProducts(req, res, next) {
    try {
        const { id } = req.params;
        const { page, limit, offset } = parsePagination(req);

        const countResult = await db.query(
            'SELECT COUNT(*) FROM website_products WHERE website_id = $1',
            [id]
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(`
            SELECT p.*, wp.custom_price, wp.is_featured
            FROM products p
            JOIN website_products wp ON p.id = wp.product_id
            WHERE wp.website_id = $1
            ORDER BY wp.is_featured DESC, p.name
            LIMIT $2 OFFSET $3
        `, [id, limit, offset]);

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
 * Get website shops
 */
async function getWebsiteShops(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT s.*,
                   (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE shop_id = s.id AND sale_date::DATE = CURRENT_DATE) as today_revenue
            FROM shops s
            WHERE s.website_id = $1
            ORDER BY s.name
        `, [id]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get website statistics
 */
async function getWebsiteStats(req, res, next) {
    try {
        const { id } = req.params;
        const { period = 'month' } = req.query;

        let interval;
        switch (period) {
            case 'today': interval = '1 day'; break;
            case 'week': interval = '7 days'; break;
            case 'month': interval = '30 days'; break;
            case 'year': interval = '365 days'; break;
            default: interval = '30 days';
        }

        const statsResult = await db.query(`
            SELECT * FROM get_sales_statistics($1, CURRENT_DATE - INTERVAL '${interval}', CURRENT_DATE)
        `, [id]);

        const dailySalesResult = await db.query(`
            SELECT 
                sale_date::DATE as date,
                COUNT(*) as sales_count,
                SUM(total_amount) as revenue
            FROM sales
            WHERE website_id = $1
            AND sale_date >= CURRENT_DATE - INTERVAL '${interval}'
            GROUP BY sale_date::DATE
            ORDER BY date
        `, [id]);

        res.json({
            success: true,
            data: {
                summary: statsResult.rows[0],
                dailySales: dailySalesResult.rows
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Create website
 */
async function createWebsite(req, res, next) {
    try {
        const { name, url, description, category } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Website name is required'
            });
        }

        const result = await db.query(`
            INSERT INTO websites (name, url, description, category)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [name, url, description, category]);

        logger.info(`Website created: ${name}`);

        res.status(201).json({
            success: true,
            message: 'Website created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update website
 */
async function updateWebsite(req, res, next) {
    try {
        const { id } = req.params;
        const { name, url, description, category, isActive } = req.body;

        const result = await db.query(`
            UPDATE websites
            SET name = COALESCE($1, name),
                url = COALESCE($2, url),
                description = COALESCE($3, description),
                category = COALESCE($4, category),
                is_active = COALESCE($5, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `, [name, url, description, category, isActive, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        res.json({
            success: true,
            message: 'Website updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Delete website
 */
async function deleteWebsite(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM websites WHERE id = $1 RETURNING name',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        logger.info(`Website deleted: ${result.rows[0].name}`);

        res.json({
            success: true,
            message: 'Website deleted successfully'
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllWebsites,
    getWebsiteById,
    getWebsiteProducts,
    getWebsiteShops,
    getWebsiteStats,
    createWebsite,
    updateWebsite,
    deleteWebsite
};