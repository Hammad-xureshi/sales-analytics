"""
============================================
PostgreSQL Database Connection Manager
Made by Hammad Naeem
============================================
"""

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import logging

from config.settings import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Database connection manager with connection pooling"""
    
    _instance = None
    _pool = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def initialize_pool(self, min_connections=1, max_connections=10):
        """Initialize the connection pool"""
        try:
            db_config = settings.get_db_config()
            logger.info(f"Initializing database connection pool to {db_config['host']}:{db_config['port']}")
            
            self._pool = psycopg2.pool.ThreadedConnectionPool(
                min_connections,
                max_connections,
                **db_config
            )
            logger.info("✅ Database connection pool initialized successfully")
            return True
        except psycopg2.OperationalError as e:
            if "password authentication failed" in str(e):
                logger.error(f"❌ Authentication Error: Check DB_PASSWORD in .env file")
                logger.error(f"   Details: {e}")
            elif "could not connect to server" in str(e):
                logger.error(f"❌ Connection Error: PostgreSQL is not running or host unreachable")
                logger.error(f"   Make sure PostgreSQL is running on {db_config['host']}:{db_config['port']}")
            else:
                logger.error(f"❌ Failed to initialize database pool: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error initializing database pool: {e}")
            return False
    
    def get_connection(self):
        """Get a connection from the pool"""
        try:
            if self._pool is None:
                success = self.initialize_pool()
                if not success:
                    raise Exception("Failed to initialize connection pool")
            
            connection = self._pool.getconn()
            logger.debug("Database connection acquired from pool")
            return connection
        except Exception as e:
            logger.error(f"Failed to get database connection: {e}")
            raise
    
    def release_connection(self, connection):
        """Release a connection back to the pool"""
        try:
            if self._pool is not None and connection is not None:
                self._pool.putconn(connection)
                logger.debug("Database connection released to pool")
        except Exception as e:
            logger.error(f"Error releasing database connection: {e}")
    
    def close_all(self):
        """Close all connections in the pool"""
        try:
            if self._pool is not None:
                self._pool.closeall()
                self._pool = None
                logger.info("All database connections closed")
        except Exception as e:
            logger.error(f"Error closing database connections: {e}")
    
    @contextmanager
    def get_cursor(self, commit=True):
        """Context manager for database operations"""
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            yield cursor
            if commit:
                connection.commit()
                logger.debug("Database transaction committed")
        except psycopg2.OperationalError as e:
            if connection:
                connection.rollback()
            if "password authentication failed" in str(e):
                logger.error("❌ Database authentication failed. Check DB_PASSWORD in .env")
            elif "could not connect to server" in str(e):
                logger.error("❌ Could not connect to PostgreSQL server. Is it running?")
            else:
                logger.error(f"Database operational error: {e}")
            raise
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                self.release_connection(connection)
    
    def execute_query(self, query, params=None, fetch=True):
        """Execute a query and optionally fetch results"""
        try:
            with self.get_cursor() as cursor:
                cursor.execute(query, params)
                if fetch:
                    return cursor.fetchall()
                return None
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def execute_many(self, query, params_list):
        """Execute a query with multiple parameter sets"""
        try:
            with self.get_cursor() as cursor:
                cursor.executemany(query, params_list)
                logger.debug(f"Executed batch query with {len(params_list)} parameter sets")
        except Exception as e:
            logger.error(f"Batch query execution failed: {e}")
            raise
    
    def test_connection(self):
        """Test the database connection"""
        try:
            with self.get_cursor() as cursor:
                cursor.execute("SELECT NOW() as current_time")
                result = cursor.fetchone()
                if result:
                    logger.info(f"✅ Database connection successful at {result['current_time']}")
                    return True
                else:
                    logger.error("❌ Database connection test returned no results")
                    return False
        except psycopg2.OperationalError as e:
            if "password authentication failed" in str(e):
                logger.error("❌ Authentication Error: Database password is incorrect")
                logger.error("   Please verify DB_PASSWORD in .env matches PostgreSQL settings")
            elif "could not connect to server" in str(e):
                logger.error("❌ Connection Error: PostgreSQL is not running")
                db_config = settings.get_db_config()
                logger.error(f"   Expected: {db_config['host']}:{db_config['port']}")
            else:
                logger.error(f"❌ Database connection test failed: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error testing connection: {e}")
            return False


# Global database instance
db = DatabaseConnection()