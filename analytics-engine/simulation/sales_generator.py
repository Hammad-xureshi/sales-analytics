"""
============================================
Fake Sales Data Generator
Made by Hammad Naeem
============================================

Generates realistic sales data based on:
- Time of day patterns
- Weekend/weekday patterns
- Multiple websites and shops
- Random but realistic product combinations
"""

import random
import uuid
from datetime import datetime
import logging

from database.connection import db
from simulation.patterns import SalesPatterns

logger = logging.getLogger(__name__)


class SalesGenerator:
    """Generates fake sales data for simulation"""
    
    def __init__(self):
        self.websites = []
        self.shops = []
        self.products = {}  # website_id -> list of products
        self.customers = []
        self._load_data()
    
    def _load_data(self):
        """Load necessary data from database"""
        try:
            # Load active websites
            self.websites = db.execute_query(
                "SELECT id, name FROM websites WHERE is_active = true"
            )
            logger.info(f"Loaded {len(self.websites)} websites")
            
            # Load shops
            self.shops = db.execute_query(
                "SELECT id, website_id, name FROM shops WHERE is_active = true"
            )
            logger.info(f"Loaded {len(self.shops)} shops")
            
            # Load products for each website
            for website in self.websites:
                products = db.execute_query("""
                    SELECT p.id, p.name, p.unit_price, p.stock_quantity
                    FROM products p
                    JOIN website_products wp ON p.id = wp.product_id
                    WHERE wp.website_id = %s AND p.is_active = true AND p.stock_quantity > 0
                """, (website['id'],))
                self.products[website['id']] = products
                logger.info(f"Loaded {len(products)} products for website {website['name']}")
            
            # Load customers
            self.customers = db.execute_query(
                "SELECT id FROM customers"
            )
            logger.info(f"Loaded {len(self.customers)} customers")
            
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            raise
    
    def reload_data(self):
        """Reload data from database"""
        self._load_data()
    
    def _get_random_website(self):
        """Get a random active website"""
        if not self.websites:
            return None
        return random.choice(self.websites)
    
    def _get_shop_for_website(self, website_id):
        """Get a random shop for a website"""
        website_shops = [s for s in self.shops if s['website_id'] == website_id]
        if not website_shops:
            return None
        return random.choice(website_shops)
    
    def _get_products_for_website(self, website_id, count):
        """Get random products for a website"""
        available_products = self.products.get(website_id, [])
        if not available_products:
            return []
        
        # Don't select more products than available
        count = min(count, len(available_products))
        return random.sample(available_products, count)
    
    def _get_random_customer(self):
        """Get a random customer or None"""
        if not self.customers or not SalesPatterns.should_have_customer():
            return None
        return random.choice(self.customers)
    
    def generate_sale(self):
        """Generate a single sale with items"""
        try:
            # Select random website
            website = self._get_random_website()
            if not website:
                logger.warning("No active websites available")
                return None
            
            # Get shop for website
            shop = self._get_shop_for_website(website['id'])
            
            # Get random products
            item_count = SalesPatterns.get_items_per_sale()
            products = self._get_products_for_website(website['id'], item_count)
            
            if not products:
                logger.warning(f"No products available for website {website['name']}")
                return None
            
            # Get customer
            customer = self._get_random_customer()
            
            # Prepare sale items
            items = []
            subtotal = 0
            
            for product in products:
                quantity = SalesPatterns.get_quantity_for_product()
                
                # Check stock
                if product['stock_quantity'] < quantity:
                    quantity = max(1, product['stock_quantity'])
                
                unit_price = float(product['unit_price'])
                line_total = unit_price * quantity
                
                items.append({
                    'product_id': product['id'],
                    'product_name': product['name'],
                    'quantity': quantity,
                    'unit_price': unit_price,
                    'line_total': line_total
                })
                
                subtotal += line_total
            
            # Calculate totals
            tax_amount = subtotal * 0.17  # 17% GST
            total_amount = subtotal + tax_amount
            
            # Create sale in database
            sale_id = self._insert_sale(
                website_id=website['id'],
                shop_id=shop['id'] if shop else None,
                customer_id=customer['id'] if customer else None,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                payment_method=SalesPatterns.get_payment_method(),
                items=items
            )
            
            if sale_id:
                logger.info(f"Generated sale {sale_id} - Amount: Rs. {total_amount:.2f} - Website: {website['name']}")
                return sale_id
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to generate sale: {e}")
            return None
    
    def _insert_sale(self, website_id, shop_id, customer_id, subtotal, tax_amount, total_amount, payment_method, items):
        """Insert sale and items into database with transaction"""
        connection = db.get_connection()
        cursor = connection.cursor()
        
        try:
            # Start transaction
            cursor.execute("BEGIN")
            
            # Insert sale
            cursor.execute("""
                INSERT INTO sales (
                    website_id, shop_id, customer_id,
                    subtotal, tax_amount, total_amount,
                    payment_method, payment_status, order_status,
                    notes
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'completed', 'completed', 'Auto-generated sale')
                RETURNING id, sale_number
            """, (
                website_id, shop_id, customer_id,
                subtotal, tax_amount, total_amount,
                payment_method
            ))
            
            sale_result = cursor.fetchone()
            sale_id = sale_result[0]
            
            # Insert sale items
            for item in items:
                cursor.execute("""
                    INSERT INTO sale_items (
                        sale_id, product_id, product_name,
                        quantity, unit_price, line_total
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    sale_id,
                    item['product_id'],
                    item['product_name'],
                    item['quantity'],
                    item['unit_price'],
                    item['line_total']
                ))
                
                # Update stock (trigger also does this, but explicit is clearer)
                cursor.execute("""
                    UPDATE products
                    SET stock_quantity = GREATEST(0, stock_quantity - %s)
                    WHERE id = %s
                """, (item['quantity'], item['product_id']))
            
            # Commit transaction
            cursor.execute("COMMIT")
            
            return sale_id
            
        except Exception as e:
            cursor.execute("ROLLBACK")
            logger.error(f"Failed to insert sale: {e}")
            raise
        finally:
            cursor.close()
            db.release_connection(connection)
    
    def generate_batch(self):
        """Generate a batch of sales based on current patterns"""
        sales_count = SalesPatterns.get_sales_count()
        logger.info(f"Generating {sales_count} sales (Time: {SalesPatterns.get_time_of_day()}, Multiplier: {SalesPatterns.get_sales_multiplier():.2f})")
        
        generated = 0
        for _ in range(sales_count):
            if self.generate_sale():
                generated += 1
        
        logger.info(f"Successfully generated {generated}/{sales_count} sales")
        return generated
    
    def replenish_stock(self):
        """Replenish stock for products running low"""
        try:
            db.execute_query("""
                UPDATE products
                SET stock_quantity = stock_quantity + 100
                WHERE stock_quantity < reorder_level
                AND is_active = true
            """, fetch=False)
            logger.info("Stock replenished for low-stock products")
        except Exception as e:
            logger.error(f"Failed to replenish stock: {e}")


# Global generator instance
sales_generator = SalesGenerator()