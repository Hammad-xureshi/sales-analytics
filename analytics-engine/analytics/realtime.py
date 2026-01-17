"""
============================================
Real-time Analytics Module
Made by Hammad Naeem
============================================
"""

import logging
from datetime import datetime, timedelta
from database.connection import db

logger = logging.getLogger(__name__)


class RealTimeAnalytics:
    """Real-time analytics calculations"""
    
    @staticmethod
    def get_current_stats():
        """Get current real-time statistics"""
        try:
            # Today's stats
            today_stats = db.execute_query("""
                SELECT 
                    COUNT(*) as total_sales,
                    COALESCE(SUM(total_amount), 0) as total_revenue,
                    COALESCE(AVG(total_amount), 0) as avg_order_value
                FROM sales
                WHERE sale_date::DATE = CURRENT_DATE
            """)
            
            # Last hour stats
            last_hour_stats = db.execute_query("""
                SELECT 
                    COUNT(*) as sales,
                    COALESCE(SUM(total_amount), 0) as revenue
                FROM sales
                WHERE sale_date >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
            """)
            
            # Last minute stats
            last_minute_stats = db.execute_query("""
                SELECT 
                    COUNT(*) as sales,
                    COALESCE(SUM(total_amount), 0) as revenue
                FROM sales
                WHERE sale_date >= CURRENT_TIMESTAMP - INTERVAL '1 minute'
            """)
            
            return {
                'today': today_stats[0] if today_stats else {},
                'last_hour': last_hour_stats[0] if last_hour_stats else {},
                'last_minute': last_minute_stats[0] if last_minute_stats else {},
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get current stats: {e}")
            return None
    
    @staticmethod
    def get_website_rankings():
        """Get website performance rankings"""
        try:
            return db.execute_query("""
                SELECT 
                    w.id,
                    w.name,
                    COUNT(s.id) as total_sales,
                    COALESCE(SUM(s.total_amount), 0) as total_revenue,
                    COALESCE(AVG(s.total_amount), 0) as avg_order_value
                FROM websites w
                LEFT JOIN sales s ON w.id = s.website_id 
                    AND s.sale_date::DATE = CURRENT_DATE
                WHERE w.is_active = true
                GROUP BY w.id, w.name
                ORDER BY total_revenue DESC
            """)
        except Exception as e:
            logger.error(f"Failed to get website rankings: {e}")
            return []
    
    @staticmethod
    def get_hourly_breakdown():
        """Get hourly sales breakdown for today"""
        try:
            result = db.execute_query("""
                SELECT 
                    EXTRACT(HOUR FROM sale_date)::INTEGER as hour,
                    COUNT(*) as sales,
                    COALESCE(SUM(total_amount), 0) as revenue
                FROM sales
                WHERE sale_date::DATE = CURRENT_DATE
                GROUP BY EXTRACT(HOUR FROM sale_date)
                ORDER BY hour
            """)
            
            # Fill in missing hours
            hourly_data = {h: {'sales': 0, 'revenue': 0} for h in range(24)}
            for row in result:
                hourly_data[row['hour']] = {
                    'sales': row['sales'],
                    'revenue': float(row['revenue'])
                }
            
            return hourly_data
            
        except Exception as e:
            logger.error(f"Failed to get hourly breakdown: {e}")
            return {}


realtime_analytics = RealTimeAnalytics()