"""
============================================
Data Aggregation Module
Made by Hammad Naeem
============================================
"""

import logging
from database.connection import db

logger = logging.getLogger(__name__)


class DataAggregations:
    """Handles data aggregation for analytics"""
    
    @staticmethod
    def aggregate_hourly_stats():
        """Aggregate hourly statistics"""
        try:
            db.execute_query("""
                INSERT INTO sales_hourly_stats (
                    website_id, shop_id, stat_date, stat_hour,
                    total_sales, total_revenue, total_items_sold, average_order_value
                )
                SELECT 
                    s.website_id,
                    s.shop_id,
                    s.sale_date::DATE as stat_date,
                    EXTRACT(HOUR FROM s.sale_date)::INTEGER as stat_hour,
                    COUNT(*)::INTEGER as total_sales,
                    SUM(s.total_amount) as total_revenue,
                    COALESCE(SUM(si.quantity), 0)::INTEGER as total_items_sold,
                    AVG(s.total_amount) as average_order_value
                FROM sales s
                LEFT JOIN sale_items si ON s.id = si.sale_id
                WHERE s.sale_date::DATE = CURRENT_DATE
                GROUP BY s.website_id, s.shop_id, s.sale_date::DATE, EXTRACT(HOUR FROM s.sale_date)
                ON CONFLICT (website_id, shop_id, stat_date, stat_hour)
                DO UPDATE SET
                    total_sales = EXCLUDED.total_sales,
                    total_revenue = EXCLUDED.total_revenue,
                    total_items_sold = EXCLUDED.total_items_sold,
                    average_order_value = EXCLUDED.average_order_value,
                    updated_at = CURRENT_TIMESTAMP
            """, fetch=False)
            
            logger.info("Hourly stats aggregated successfully")
            
        except Exception as e:
            logger.error(f"Failed to aggregate hourly stats: {e}")
    
    @staticmethod
    def aggregate_daily_stats():
        """Aggregate daily statistics"""
        try:
            db.execute_query("""
                INSERT INTO sales_daily_stats (
                    website_id, stat_date,
                    total_sales, total_revenue, total_items_sold,
                    unique_customers, average_order_value
                )
                SELECT 
                    s.website_id,
                    s.sale_date::DATE as stat_date,
                    COUNT(*)::INTEGER as total_sales,
                    SUM(s.total_amount) as total_revenue,
                    COALESCE(SUM(si.quantity), 0)::INTEGER as total_items_sold,
                    COUNT(DISTINCT s.customer_id)::INTEGER as unique_customers,
                    AVG(s.total_amount) as average_order_value
                FROM sales s
                LEFT JOIN sale_items si ON s.id = si.sale_id
                WHERE s.sale_date::DATE = CURRENT_DATE
                GROUP BY s.website_id, s.sale_date::DATE
                ON CONFLICT (website_id, stat_date)
                DO UPDATE SET
                    total_sales = EXCLUDED.total_sales,
                    total_revenue = EXCLUDED.total_revenue,
                    total_items_sold = EXCLUDED.total_items_sold,
                    unique_customers = EXCLUDED.unique_customers,
                    average_order_value = EXCLUDED.average_order_value,
                    updated_at = CURRENT_TIMESTAMP
            """, fetch=False)
            
            logger.info("Daily stats aggregated successfully")
            
        except Exception as e:
            logger.error(f"Failed to aggregate daily stats: {e}")
    
    @staticmethod
    def get_top_products(limit=10, days=30):
        """Get top selling products"""
        try:
            return db.execute_query("""
                SELECT 
                    p.id,
                    p.sku,
                    p.name,
                    SUM(si.quantity) as total_sold,
                    SUM(si.line_total) as total_revenue
                FROM sale_items si
                JOIN products p ON si.product_id = p.id
                JOIN sales s ON si.sale_id = s.id
                WHERE s.sale_date >= CURRENT_DATE - %s
                GROUP BY p.id, p.sku, p.name
                ORDER BY total_sold DESC
                LIMIT %s
            """, (days, limit))
        except Exception as e:
            logger.error(f"Failed to get top products: {e}")
            return []


aggregations = DataAggregations()