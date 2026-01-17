/**
 * ============================================
 * Sales Controller
 * Made by Hammad Naeem
 * ============================================
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const socketService = require('../services/socketService');
const { parsePagination, getPaginationMeta } = require('../utils/helpers');

/**
 * Get all sales with pagination and filters
 */
async function getAllSales(req, res, next) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const { websiteId, shopId, startDate, endDate, paymentMethod } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (websiteId) {
            whereClause += ` AND s.website_id = $${paramIndex}`;
            params.push(websiteId);
            paramIndex++;
        }

        if (shopId) {
            whereClause += ` AND s.shop_id = $${paramIndex}`;
            params.push(shopId);
            paramIndex++;
        }

        if (startDate) {
            whereClause += ` AND s.sale_date >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            whereClause += ` AND s.sale_date <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        if (paymentMethod) {
            whereClause += ` AND s.payment_method = $${paramIndex}`;
            params.push(paymentMethod);
            paramIndex++;
        }

        const countResult = await db.query(
            `SELECT COUNT(*) FROM sales s ${whereClause}`,
            params
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(`
            SELECT s.*, w.name as website_name, sh.name as shop_name,
                   (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
            FROM sales s
            LEFT JOIN websites w ON s.website_id = w.id
            LEFT JOIN shops sh ON s.shop_id = sh.id
            ${whereClause}
            ORDER BY s.sale_date DESC
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
 * Get recent sales (last 100)
 */
async function getRecentSales(req, res, next) {
    try {
        const result = await db.query(`SELECT * FROM v_recent_sales`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get today's sales
 */
async function getTodaySales(req, res, next) {
    try {
        const { websiteId } = req.query;

        let whereClause = "WHERE sale_date::DATE = CURRENT_DATE";
        const params = [];

        if (websiteId) {
            whereClause += " AND website_id = $1";
            params.push(websiteId);
        }

        const result = await db.query(`
            SELECT s.*, w.name as website_name, sh.name as shop_name
            FROM sales s
            LEFT JOIN websites w ON s.website_id = w.id
            LEFT JOIN shops sh ON s.shop_id = sh.id
            ${whereClause}
            ORDER BY s.sale_date DESC
        `, params);

        const summaryResult = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            FROM sales
            ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                sales: result.rows,
                summary: summaryResult.rows[0]
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get sale by ID with full details
 */
async function getSaleById(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT s.*, w.name as website_name, sh.name as shop_name,
                   c.first_name as customer_first_name, c.last_name as customer_last_name,
                   c.email as customer_email, c.phone as customer_phone
            FROM sales s
            LEFT JOIN websites w ON s.website_id = w.id
            LEFT JOIN shops sh ON s.shop_id = sh.id
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        // Get sale items
        const itemsResult = await db.query(`
            SELECT si.*, p.sku, p.image_url
            FROM sale_items si
            LEFT JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = $1
            ORDER BY si.id
        `, [id]);

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                items: itemsResult.rows
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get sale items
 */
async function getSaleItems(req, res, next) {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT si.*, p.sku, p.name as product_name, p.image_url
            FROM sale_items si
            LEFT JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = $1
            ORDER BY si.id
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
 * Create new sale with items (ACID Transaction)
 */
async function createSale(req, res, next) {
    const client = await db.getClient();
    
    try {
        const { websiteId, shopId, customerId, items, paymentMethod, notes } = req.body;

        // Start transaction
        await client.query('BEGIN');

        // Validate website exists
        const websiteCheck = await client.query(
            'SELECT id FROM websites WHERE id = $1 AND is_active = true',
            [websiteId]
        );
        if (websiteCheck.rows.length === 0) {
            throw new Error('Website not found or inactive');
        }

        // Validate and calculate items
        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const productResult = await client.query(
                'SELECT id, name, unit_price, stock_quantity FROM products WHERE id = $1 AND is_active = true',
                [item.productId]
            );

            if (productResult.rows.length === 0) {
                throw new Error(`Product ${item.productId} not found or inactive`);
            }

            const product = productResult.rows[0];

            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            const lineTotal = parseFloat(product.unit_price) * item.quantity;
            subtotal += lineTotal;

            validatedItems.push({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.unit_price,
                lineTotal: lineTotal
            });
        }

        // Calculate tax (17% GST for Pakistan)
        const taxAmount = subtotal * 0.17;
        const totalAmount = subtotal + taxAmount;

        // Create sale record
        const saleResult = await client.query(`
            INSERT INTO sales (
                website_id, shop_id, customer_id, user_id,
                subtotal, tax_amount, total_amount,
                payment_method, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            websiteId,
            shopId || null,
            customerId || null,
            req.user.id,
            subtotal,
            taxAmount,
            totalAmount,
            paymentMethod || 'cash',
            notes || null
        ]);

        const sale = saleResult.rows[0];

        // Insert sale items and update stock
        for (const item of validatedItems) {
            // Insert sale item
            await client.query(`
                INSERT INTO sale_items (
                    sale_id, product_id, product_name, quantity, unit_price, line_total
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                sale.id,
                item.productId,
                item.productName,
                item.quantity,
                item.unitPrice,
                item.lineTotal
            ]);
        }

        // Commit transaction
        await client.query('COMMIT');

        logger.info(`Sale created: ${sale.sale_number} - Amount: ${totalAmount}`);

        // Fetch complete sale data
        const completeSale = await db.query(`
            SELECT s.*, w.name as website_name, sh.name as shop_name
            FROM sales s
            LEFT JOIN websites w ON s.website_id = w.id
            LEFT JOIN shops sh ON s.shop_id = sh.id
            WHERE s.id = $1
        `, [sale.id]);

        const saleItems = await db.query(
            'SELECT * FROM sale_items WHERE sale_id = $1',
            [sale.id]
        );

        const saleWithItems = {
            ...completeSale.rows[0],
            items: saleItems.rows
        };

        // 🔥 Emit real-time alert via Socket.io
        socketService.emitNewSaleAlert(saleWithItems);

        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: saleWithItems
        });

    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        logger.error('Sale creation failed:', error.message);
        
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create sale'
        });
    } finally {
        client.release();
    }
}

/**
 * Update sale status
 */
async function updateSaleStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const result = await db.query(`
            UPDATE sales
            SET order_status = COALESCE($1, order_status),
                payment_status = COALESCE($2, payment_status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `, [orderStatus, paymentStatus, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        logger.info(`Sale ${id} status updated`);

        res.json({
            success: true,
            message: 'Sale status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllSales,
    getRecentSales,
    getTodaySales,
    getSaleById,
    getSaleItems,
    createSale,
    updateSaleStatus
};