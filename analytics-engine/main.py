"""
============================================
Sales Analytics Engine - Main Entry Point
Made by Hammad Naeem
============================================

This Python service runs in the background and:
1. Generates fake sales data at regular intervals
2. Aggregates statistics for analytics
3. Manages stock replenishment
"""

import time
import signal
import sys
import logging
import schedule
from datetime import datetime

from config.settings import settings
from database.connection import db
from simulation.sales_generator import sales_generator
from analytics.aggregations import aggregations
from analytics.realtime import realtime_analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('analytics_engine.log')
    ]
)
logger = logging.getLogger(__name__)

# Global flag for graceful shutdown
running = True


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global running
    logger.info("Shutdown signal received. Stopping gracefully...")
    running = False


def generate_sales_job():
    """Job to generate sales"""
    try:
        logger.info("=" * 50)
        logger.info(f"Running sales generation - {datetime.now()}")
        
        generated = sales_generator.generate_batch()
        
        # Log current stats
        stats = realtime_analytics.get_current_stats()
        if stats:
            today = stats.get('today', {})
            logger.info(f"Today's Total: {today.get('total_sales', 0)} sales, Rs. {float(today.get('total_revenue', 0)):,.2f}")
        
        logger.info("=" * 50)
        
    except Exception as e:
        logger.error(f"Error in sales generation job: {e}")


def aggregate_stats_job():
    """Job to aggregate statistics"""
    try:
        logger.info("Running statistics aggregation...")
        aggregations.aggregate_hourly_stats()
        aggregations.aggregate_daily_stats()
        logger.info("Statistics aggregation completed")
    except Exception as e:
        logger.error(f"Error in aggregation job: {e}")


def replenish_stock_job():
    """Job to replenish low stock"""
    try:
        logger.info("Checking and replenishing stock...")
        sales_generator.replenish_stock()
    except Exception as e:
        logger.error(f"Error in stock replenishment: {e}")


def reload_data_job():
    """Job to reload data from database"""
    try:
        logger.info("Reloading product and website data...")
        sales_generator.reload_data()
    except Exception as e:
        logger.error(f"Error reloading data: {e}")


def print_banner():
    """Print startup banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║     Sales Analytics Engine                               ║
    ║     Made by Hammad Naeem                                 ║
    ║                                                          ║
    ║     Multi-Website Real-Time Sales Analytics & ERP        ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(banner)
    logger.info("Sales Analytics Engine Starting...")


def main():
    """Main entry point"""
    global running
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print_banner()
    
    # Validate and display database configuration
    logger.info("Validating database configuration...")
    settings.print_db_config_summary()
    if not settings.validate_db_config():
        logger.warning("⚠️  Database configuration validation returned warnings")
    
    # Test database connection
    logger.info("Testing database connection...")
    if not db.test_connection():
        logger.error("❌ Failed to connect to database. Cannot proceed.")
        logger.error("\nPlease fix the following:")
        logger.error("1. Ensure PostgreSQL is running on " + settings.DB_HOST + ":" + str(settings.DB_PORT))
        logger.error("2. Verify DB_PASSWORD in .env file matches your PostgreSQL password")
        logger.error("3. Confirm PostgreSQL has 'md5' authentication enabled in pg_hba.conf")
        logger.error("4. Ensure database '" + settings.DB_NAME + "' exists")
        sys.exit(1)
    
    logger.info("✅ Database connection successful!")
    
    # Check if simulation is enabled
    if not settings.ENABLE_SIMULATION:
        logger.info("Simulation is disabled. Only running aggregation jobs.")
    else:
        logger.info(f"Simulation enabled. Interval: {settings.SIMULATION_INTERVAL} seconds")
    
    # Schedule jobs
    if settings.ENABLE_SIMULATION:
        # Generate sales every minute
        schedule.every(settings.SIMULATION_INTERVAL).seconds.do(generate_sales_job)
    
    # Aggregate stats every 5 minutes
    schedule.every(5).minutes.do(aggregate_stats_job)
    
    # Replenish stock every 30 minutes
    schedule.every(30).minutes.do(replenish_stock_job)
    
    # Reload data every 10 minutes
    schedule.every(10).minutes.do(reload_data_job)
    
    # Run initial jobs
    logger.info("Running initial jobs...")
    if settings.ENABLE_SIMULATION:
        generate_sales_job()
    aggregate_stats_job()
    
    logger.info("Scheduler started. Press Ctrl+C to stop.")
    
    # Main loop
    while running:
        try:
            schedule.run_pending()
            time.sleep(1)
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            time.sleep(5)
    
    # Cleanup
    logger.info("Shutting down...")
    db.close_all()
    logger.info("Analytics Engine stopped.")


if __name__ == "__main__":
    main()