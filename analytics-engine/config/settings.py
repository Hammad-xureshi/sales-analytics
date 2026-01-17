"""
============================================
Python Analytics Engine Configuration
Made by Hammad Naeem
============================================
"""

import os
from dotenv import load_dotenv
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    """Application settings loaded from environment variables"""
    
    # Database settings
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 5432))
    DB_NAME = os.getenv('DB_NAME', 'sales_analytics_erp')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    
    # Simulation settings
    SIMULATION_INTERVAL = int(os.getenv('SIMULATION_INTERVAL_SECONDS', 60))
    ENABLE_SIMULATION = os.getenv('ENABLE_SIMULATION', 'true').lower() == 'true'
    
    # Sales patterns
    SALES_PER_MINUTE_MIN = 1
    SALES_PER_MINUTE_MAX = 5
    
    # Peak hours configuration (Pakistan timezone)
    PEAK_HOURS = {
        'morning': {'start': 9, 'end': 12, 'multiplier': 1.2},
        'afternoon': {'start': 12, 'end': 17, 'multiplier': 1.5},
        'evening': {'start': 17, 'end': 22, 'multiplier': 2.0},
        'night': {'start': 22, 'end': 9, 'multiplier': 0.5}
    }
    
    # Weekend multiplier
    WEEKEND_MULTIPLIER = 1.5
    
    @classmethod
    def validate_db_config(cls):
        """Validate database configuration"""
        if not cls.DB_PASSWORD:
            logger.warning("⚠️  Warning: DB_PASSWORD is empty in .env file")
            logger.warning("   Database connection will likely fail with authentication error")
            return False
        
        if cls.DB_HOST not in ['127.0.0.1', 'localhost']:
            logger.warning(f"⚠️  Warning: DB_HOST is set to '{cls.DB_HOST}'")
            logger.warning("   For local development, use '127.0.0.1' to avoid IPv6 issues")
        
        return True
    
    @classmethod
    def get_db_connection_string(cls):
        """Get PostgreSQL connection string"""
        return f"host={cls.DB_HOST} port={cls.DB_PORT} dbname={cls.DB_NAME} user={cls.DB_USER} password={cls.DB_PASSWORD}"
    
    @classmethod
    def get_db_config(cls):
        """Get database configuration dictionary"""
        return {
            'host': cls.DB_HOST,
            'port': cls.DB_PORT,
            'database': cls.DB_NAME,
            'user': cls.DB_USER,
            'password': cls.DB_PASSWORD
        }
    
    @classmethod
    def print_db_config_summary(cls):
        """Print database configuration (without password) for debugging"""
        logger.info("Database Configuration:")
        logger.info(f"  Host: {cls.DB_HOST}")
        logger.info(f"  Port: {cls.DB_PORT}")
        logger.info(f"  Database: {cls.DB_NAME}")
        logger.info(f"  User: {cls.DB_USER}")
        logger.info(f"  Password: {'*' * len(cls.DB_PASSWORD) if cls.DB_PASSWORD else 'NOT SET'}")


settings = Settings()