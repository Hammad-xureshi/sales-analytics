/**
 * ============================================
 * Analytics Controller
 * Made by Hammad Naeem
 * ============================================
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { getDateRange } = require('../utils/helpers');

/**
 * Get dashboard overview statistics
 */
async function getDashboardStats(req, res, next) {
    try {
        // Today's stats
        const todayStats = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value,
                COUNT(DISTINCT customer_id) as unique_customers
            FROM sales
            WHERE sale_date::DATE = CURRENT_DATE
        `);

        // Yesterday's stats for comparison
        const yesterdayStats = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue
            FROM sales
            WHERE sale_date::DATE = CURRENT_DATE - INTERVAL '1 day'
        `);

        // This month's stats
        const monthStats = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue
            FROM sales
            WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)
        `);

        // Active websites
        const websiteCount = await db.query(
            'SELECT COUNT(*) FROM websites WHERE is_active = true'
        );

        // Active products
        const productCount = await db.query(
            'SELECT COUNT(*) FROM products WHERE is_active = true'
        );

        // Low stock count
        const lowStockCount = await db.query(
            'SELECT COUNT(*) FROM products WHERE stock_quantity < reorder_level AND is_active = true'
        );

        // Recent sales count (last hour)
        const recentSalesCount = await db.query(`
            SELECT COUNT(*) FROM sales
            WHERE sale_date >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
        `);

        // Calculate percentage changes
        const today = todayStats.rows[0];
        const yesterday = yesterdayStats.rows[0];
        
        const revenueChange = yesterday.total_revenue > 0 
            ? ((today.total_revenue - yesterday.total_revenue) / yesterday.total_revenue * 100).toFixed(2)
            : 100;

        const salesChange = yesterday.total_sales > 0
            ? ((today.total_sales - yesterday.total_sales) / yesterday.total_sales * 100).toFixed(2)
            : 100;

        res.json({
            success: true,
            data: {
                today: {
                    totalSales: parseInt(today.total_sales),
                    totalRevenue: parseFloat(today.total_revenue),
                    avgOrderValue: parseFloat(today.avg_order_value),
                    uniqueCustomers: parseInt(today.unique_customers)
                },
                comparison: {
                    revenueChange: parseFloat(revenueChange),
                    salesChange: parseFloat(salesChange)
                },
                month: {
                    totalSales: parseInt(monthStats.rows[0].total_sales),
                    totalRevenue: parseFloat(monthStats.rows[0].total_revenue)
                },
                counts: {
                    websites: parseInt(websiteCount.rows[0].count),
                    products: parseInt(productCount.rows[0].count),
                    lowStock: parseInt(lowStockCount.rows[0].count),
                    recentSales: parseInt(recentSalesCount.rows[0].count)
                }
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get sales summary for a period
 */
async function getSalesSummary(req, res, next) {
    try {
        const { period = 'month', websiteId } = req.query;
        const dateRange = getDateRange(period);

        let whereClause = 'WHERE sale_date BETWEEN $1 AND $2';
        const params = [dateRange.start, dateRange.end];

        if (websiteId) {
            whereClause += ' AND website_id = $3';
            params.push(websiteId);
        }

        const result = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(subtotal), 0) as subtotal,
                COALESCE(SUM(tax_amount), 0) as total_tax,
                COALESCE(AVG(total_amount), 0) as avg_order_value,
                COUNT(DISTINCT customer_id) as unique_customers,
                COUNT(DISTINCT website_id) as websites_with_sales
            FROM sales
            ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                period,
                startDate: dateRange.start,
                endDate: dateRange.end,
                ...result.rows[0]
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get hourly sales pattern
 */
async function getHourlySales(req, res, next) {
    try {
        const { date, websiteId } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        let whereClause = 'WHERE sale_date::DATE = $1';
        const params = [targetDate];

        if (websiteId) {
            whereClause += ' AND website_id = $2';
            params.push(websiteId);
        }

        const result = await db.query(`
            SELECT 
                EXTRACT(HOUR FROM sale_date)::INTEGER as hour,
                COUNT(*) as sales_count,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            ${whereClause}
            GROUP BY EXTRACT(HOUR FROM sale_date)
            ORDER BY hour
        `, params);

        // Fill in missing hours with zero
        const hourlyData = [];
        for (let hour = 0; hour < 24; hour++) {
            const found = result.rows.find(r => r.hour === hour);
            hourlyData.push({
                hour,
                label: `${hour.toString().padStart(2, '0')}:00`,
                salesCount: found ? parseInt(found.sales_count) : 0,
                revenue: found ? parseFloat(found.revenue) : 0
            });
        }

        res.json({
            success: true,
            data: {
                date: targetDate,
                hourlyData
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get daily sales for a period
 */
async function getDailySales(req, res, next) {
    try {
        const { days = 30, websiteId } = req.query;

        let whereClause = 'WHERE sale_date >= CURRENT_DATE - $1::INTEGER';
        const params = [days];

        if (websiteId) {
            whereClause += ' AND website_id = $2';
            params.push(websiteId);
        }

        const result = await db.query(`
            SELECT 
                sale_date::DATE as date,
                COUNT(*) as sales_count,
                COALESCE(SUM(total_amount), 0) as revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            FROM sales
            ${whereClause}
            GROUP BY sale_date::DATE
            ORDER BY date
        `, params);

        res.json({
            success: true,
            data: result.rows.map(row => ({
                date: row.date,
                salesCount: parseInt(row.sales_count),
                revenue: parseFloat(row.revenue),
                avgOrderValue: parseFloat(row.avg_order_value)
            }))
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get monthly sales
 */
async function getMonthlySales(req, res, next) {
    try {
        const { months = 12, websiteId } = req.query;

        let whereClause = `WHERE sale_date >= CURRENT_DATE - INTERVAL '${months} months'`;
        const params = [];

        if (websiteId) {
            whereClause += ' AND website_id = $1';
            params.push(websiteId);
        }

        const result = await db.query(`
            SELECT 
                DATE_TRUNC('month', sale_date) as month,
                TO_CHAR(DATE_TRUNC('month', sale_date), 'Mon YYYY') as month_label,
                COUNT(*) as sales_count,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            ${whereClause}
            GROUP BY DATE_TRUNC('month', sale_date)
            ORDER BY month
        `, params);

        res.json({
            success: true,
            data: result.rows.map(row => ({
                month: row.month,
                monthLabel: row.month_label,
                salesCount: parseInt(row.sales_count),
                revenue: parseFloat(row.revenue)
            }))
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get website comparison
 */
async function getWebsiteComparison(req, res, next) {
    try {
        const { period = 'month' } = req.query;
        const dateRange = getDateRange(period);

        const result = await db.query(`
            SELECT * FROM get_website_performance($1, $2)
        `, [dateRange.start, dateRange.end]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get website performance details
 */
async function getWebsitePerformance(req, res, next) {
    try {
        const result = await db.query(`
            SELECT * FROM v_today_sales_summary
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
 * Get top selling products
 */
async function getTopSellingProducts(req, res, next) {
    try {
        const { limit = 10, period = 'month' } = req.query;
        const dateRange = getDateRange(period);

        const result = await db.query(`
            SELECT * FROM get_top_selling_products($1, $2, $3)
        `, [limit, dateRange.start, dateRange.end]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get category breakdown
 */
async function getCategoryBreakdown(req, res, next) {
    try {
        const { period = 'month' } = req.query;
        const dateRange = getDateRange(period);

        const result = await db.query(`
            SELECT 
                c.id as category_id,
                c.name as category_name,
                COUNT(DISTINCT s.id) as total_orders,
                COALESCE(SUM(si.quantity), 0) as total_items_sold,
                COALESCE(SUM(si.line_total), 0) as total_revenue
            FROM product_categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN sale_items si ON p.id = si.product_id
            LEFT JOIN sales s ON si.sale_id = s.id AND s.sale_date BETWEEN $1 AND $2
            GROUP BY c.id, c.name
            HAVING COALESCE(SUM(si.line_total), 0) > 0
            ORDER BY total_revenue DESC
        `, [dateRange.start, dateRange.end]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get peak sales hours
 */
async function getPeakHours(req, res, next) {
    try {
        const { days = 30 } = req.query;

        const result = await db.query(`
            SELECT 
                EXTRACT(HOUR FROM sale_date)::INTEGER as hour,
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(AVG(total_amount), 0) as avg_order_value
            FROM sales
            WHERE sale_date >= CURRENT_DATE - $1::INTEGER
            GROUP BY EXTRACT(HOUR FROM sale_date)
            ORDER BY total_sales DESC
        `, [days]);

        // Categorize hours
        const categorized = result.rows.map(row => ({
            hour: row.hour,
            label: `${row.hour.toString().padStart(2, '0')}:00`,
            totalSales: parseInt(row.total_sales),
            totalRevenue: parseFloat(row.total_revenue),
            avgOrderValue: parseFloat(row.avg_order_value),
            category: row.hour >= 6 && row.hour < 12 ? 'Morning' :
                      row.hour >= 12 && row.hour < 17 ? 'Afternoon' :
                      row.hour >= 17 && row.hour < 21 ? 'Evening' : 'Night'
        }));

        res.json({
            success: true,
            data: categorized
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get sales trends
 */
async function getSalesTrends(req, res, next) {
    try {
        // Current week vs last week
        const currentWeek = await db.query(`
            SELECT 
                COUNT(*) as sales,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            WHERE sale_date >= DATE_TRUNC('week', CURRENT_DATE)
        `);

        const lastWeek = await db.query(`
            SELECT 
                COUNT(*) as sales,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            WHERE sale_date >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
            AND sale_date < DATE_TRUNC('week', CURRENT_DATE)
        `);

        // Current month vs last month
        const currentMonth = await db.query(`
            SELECT 
                COUNT(*) as sales,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)
        `);

        const lastMonth = await db.query(`
            SELECT 
                COUNT(*) as sales,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
            AND sale_date < DATE_TRUNC('month', CURRENT_DATE)
        `);

        res.json({
            success: true,
            data: {
                weekly: {
                    current: currentWeek.rows[0],
                    previous: lastWeek.rows[0],
                    salesChange: lastWeek.rows[0].sales > 0 
                        ? ((currentWeek.rows[0].sales - lastWeek.rows[0].sales) / lastWeek.rows[0].sales * 100).toFixed(2)
                        : 100,
                    revenueChange: lastWeek.rows[0].revenue > 0
                        ? ((currentWeek.rows[0].revenue - lastWeek.rows[0].revenue) / lastWeek.rows[0].revenue * 100).toFixed(2)
                        : 100
                },
                monthly: {
                    current: currentMonth.rows[0],
                    previous: lastMonth.rows[0],
                    salesChange: lastMonth.rows[0].sales > 0
                        ? ((currentMonth.rows[0].sales - lastMonth.rows[0].sales) / lastMonth.rows[0].sales * 100).toFixed(2)
                        : 100,
                    revenueChange: lastMonth.rows[0].revenue > 0
                        ? ((currentMonth.rows[0].revenue - lastMonth.rows[0].revenue) / lastMonth.rows[0].revenue * 100).toFixed(2)
                        : 100
                }
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Get real-time sales counter
 */
async function getRealTimeCounter(req, res, next) {
    try {
        // Today's real-time stats
        const todayResult = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_amount), 0) as total_revenue
            FROM sales
            WHERE sale_date::DATE = CURRENT_DATE
        `);

        // Last hour
        const lastHourResult = await db.query(`
            SELECT 
                COUNT(*) as sales,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            WHERE sale_date >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
        `);

        // Last 5 minutes
        const lastFiveMinResult = await db.query(`
            SELECT 
                COUNT(*) as sales,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM sales
            WHERE sale_date >= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
        `);

        // Latest sale
        const latestSale = await db.query(`
            SELECT s.sale_number, s.total_amount, s.sale_date, w.name as website_name
            FROM sales s
            LEFT JOIN websites w ON s.website_id = w.id
            ORDER BY s.sale_date DESC
            LIMIT 1
        `);

        res.json({
            success: true,
            data: {
                today: {
                    sales: parseInt(todayResult.rows[0].total_sales),
                    revenue: parseFloat(todayResult.rows[0].total_revenue)
                },
                lastHour: {
                    sales: parseInt(lastHourResult.rows[0].sales),
                    revenue: parseFloat(lastHourResult.rows[0].revenue)
                },
                lastFiveMinutes: {
                    sales: parseInt(lastFiveMinResult.rows[0].sales),
                    revenue: parseFloat(lastFiveMinResult.rows[0].revenue)
                },
                latestSale: latestSale.rows[0] || null,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDashboardStats,
    getSalesSummary,
    getHourlySales,
    getDailySales,
    getMonthlySales,
    getWebsiteComparison,
    getWebsitePerformance,
    getTopSellingProducts,
    getCategoryBreakdown,
    getPeakHours,
    getSalesTrends,
    getRealTimeCounter
};