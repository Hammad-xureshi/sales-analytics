/**
 * ============================================
 * Product Controller
 * Made by Hammad Naeem
 * ============================================
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { parsePagination, getPaginationMeta } = require('../utils/helpers');

/**
 * Get all products
 */
async function getAllProducts(req, res, next) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const { category, search, status } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND p.category_id = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status === 'active') {
            whereClause += ' AND p.is_active = true';
        } else if (status === 'inactive') {
            whereClause += ' AND p.is_active = false';
        }

        const countResult = await db.query(
            `SELECT COUNT(*) FROM products p ${whereClause}`,
            params
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(`
            SELECT p.*, c.name as category_name,
                   (SELECT COALESCE(SUM(quantity), 0) FROM sale_items WHERE product_id = p.id) as total_sold
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY p.name
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
 * Get product categories
 */
async function getCategories(req, res, next) {
    try {
        const result = await db.query(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM product_categories c
            ORDER BY c.name
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get low stock products
 */
async function getLowStockProducts(req, res, next) {
    try {
        const result = await db.query(`
            SELECT * FROM v_low_stock_products
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get product by ID
 */
async function getProductById(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get sales statistics for this product
        const statsResult = await db.query(`
            SELECT 
                COALESCE(SUM(quantity), 0) as total_sold,
                COALESCE(SUM(line_total), 0) as total_revenue,
                COUNT(DISTINCT sale_id) as number_of_orders
            FROM sale_items
            WHERE product_id = $1
        `, [id]);

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                salesStats: statsResult.rows[0]
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Create product
 */
async function createProduct(req, res, next) {
    try {
        const { sku, name, description, categoryId, unitPrice, costPrice, stockQuantity, reorderLevel } = req.body;

        // Check SKU uniqueness
        const existingSku = await db.query('SELECT id FROM products WHERE sku = $1', [sku]);
        if (existingSku.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Product with this SKU already exists'
            });
        }

        const result = await db.query(`
            INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, stock_quantity, reorder_level)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [sku, name, description, categoryId, unitPrice, costPrice || 0, stockQuantity || 0, reorderLevel || 10]);

        logger.info(`Product created: ${name} (${sku})`);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update product
 */
async function updateProduct(req, res, next) {
    try {
        const { id } = req.params;
        const { name, description, categoryId, unitPrice, costPrice, reorderLevel, isActive } = req.body;

        const result = await db.query(`
            UPDATE products
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                category_id = COALESCE($3, category_id),
                unit_price = COALESCE($4, unit_price),
                cost_price = COALESCE($5, cost_price),
                reorder_level = COALESCE($6, reorder_level),
                is_active = COALESCE($7, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `, [name, description, categoryId, unitPrice, costPrice, reorderLevel, isActive, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Update product stock
 */
async function updateStock(req, res, next) {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body;

        if (quantity === undefined || !operation) {
            return res.status(400).json({
                success: false,
                message: 'Quantity and operation (add/subtract/set) are required'
            });
        }

        let updateQuery;
        if (operation === 'add') {
            updateQuery = 'stock_quantity = stock_quantity + $1';
        } else if (operation === 'subtract') {
            updateQuery = 'stock_quantity = GREATEST(0, stock_quantity - $1)';
        } else if (operation === 'set') {
            updateQuery = 'stock_quantity = $1';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid operation. Use add, subtract, or set'
            });
        }

        const result = await db.query(`
            UPDATE products
            SET ${updateQuery}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, sku, name, stock_quantity
        `, [quantity, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        logger.info(`Stock updated for product ${id}: ${operation} ${quantity}`);

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Delete product
 */
async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING name, sku',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        logger.info(`Product deleted: ${result.rows[0].name} (${result.rows[0].sku})`);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllProducts,
    getCategories,
    getLowStockProducts,
    getProductById,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct
};