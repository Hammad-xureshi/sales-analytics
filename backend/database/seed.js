/**
 * ============================================
 * Database Seeding
 * Made by Hammad Naeem
 * ============================================
 * 
 * Seeds initial data including:
 * - Roles
 * - Admin user
 * - Demo websites
 * - Demo shops
 * - Product categories
 * - Demo products
 */

const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logger = require('../utils/logger');

async function seedDatabase(db) {
    logger.info('Seeding database with initial data...');

    // Check if already seeded
    const rolesCheck = await db.query('SELECT COUNT(*) FROM roles');
    if (parseInt(rolesCheck.rows[0].count) > 0) {
        logger.info('Database already seeded, skipping...');
        return;
    }

    try {
        // ============================================
        // SEED ROLES
        // ============================================
        logger.info('Seeding roles...');
        await db.query(`
            INSERT INTO roles (name, description, permissions) VALUES
            ('Admin', 'Full system access - can manage all aspects', 
             '["users:read", "users:write", "users:delete", "sales:read", "sales:write", "sales:delete", "products:read", "products:write", "products:delete", "websites:read", "websites:write", "websites:delete", "analytics:read", "reports:read", "settings:manage"]'::jsonb),
            ('Manager', 'Can manage sales and view reports', 
             '["sales:read", "sales:write", "products:read", "products:write", "websites:read", "analytics:read", "reports:read"]'::jsonb),
            ('Viewer', 'Read-only access to dashboards and reports', 
             '["sales:read", "products:read", "websites:read", "analytics:read", "reports:read"]'::jsonb)
            ON CONFLICT (name) DO NOTHING;
        `);

        // ============================================
        // SEED ADMIN USER
        // ============================================
        logger.info('Seeding admin user...');
        const hashedPassword = await bcrypt.hash('admin123', config.bcrypt.saltRounds);
        await db.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            SELECT 'admin@saleserp.com', $1, 'Hammad', 'Naeem', id
            FROM roles WHERE name = 'Admin'
            ON CONFLICT (email) DO NOTHING;
        `, [hashedPassword]);

        // Create demo manager user
        const managerPassword = await bcrypt.hash('manager123', config.bcrypt.saltRounds);
        await db.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            SELECT 'manager@saleserp.com', $1, 'Sales', 'Manager', id
            FROM roles WHERE name = 'Manager'
            ON CONFLICT (email) DO NOTHING;
        `, [managerPassword]);

        // Create demo viewer user
        const viewerPassword = await bcrypt.hash('viewer123', config.bcrypt.saltRounds);
        await db.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role_id)
            SELECT 'viewer@saleserp.com', $1, 'Report', 'Viewer', id
            FROM roles WHERE name = 'Viewer'
            ON CONFLICT (email) DO NOTHING;
        `, [viewerPassword]);

        // ============================================
        // SEED WEBSITES
        // ============================================
        logger.info('Seeding websites...');
        await db.query(`
            INSERT INTO websites (name, url, description, category) VALUES
            ('TechMart Online', 'https://techmart.local', 'Electronics and gadgets e-commerce store', 'Electronics'),
            ('Fashion Hub', 'https://fashionhub.local', 'Clothing and fashion accessories', 'Fashion'),
            ('Home Essentials', 'https://homeessentials.local', 'Home decor and furniture', 'Home & Garden'),
            ('Sports Galaxy', 'https://sportsgalaxy.local', 'Sports equipment and activewear', 'Sports'),
            ('Book Haven', 'https://bookhaven.local', 'Books and educational materials', 'Books'),
            ('Food Express', 'https://foodexpress.local', 'Grocery and food delivery', 'Food & Grocery')
            ON CONFLICT DO NOTHING;
        `);

        // ============================================
        // SEED SHOPS
        // ============================================
        logger.info('Seeding shops/branches...');
        await db.query(`
            INSERT INTO shops (website_id, name, location, city, manager_name, contact_phone, contact_email) VALUES
            (1, 'TechMart Lahore Main', 'Liberty Market, Gulberg III', 'Lahore', 'Ahmad Khan', '+92-300-1234567', 'lahore@techmart.local'),
            (1, 'TechMart Karachi Hub', 'Dolmen Mall, Clifton', 'Karachi', 'Hassan Ali', '+92-300-2345678', 'karachi@techmart.local'),
            (1, 'TechMart Islamabad', 'Centaurus Mall', 'Islamabad', 'Usman Tariq', '+92-300-3456789', 'islamabad@techmart.local'),
            (2, 'Fashion Hub Lahore', 'Packages Mall, Walton Road', 'Lahore', 'Ayesha Malik', '+92-300-4567890', 'lahore@fashionhub.local'),
            (2, 'Fashion Hub Karachi', 'Dolmen Mall, Hyderi', 'Karachi', 'Sara Ahmed', '+92-300-5678901', 'karachi@fashionhub.local'),
            (3, 'Home Essentials Warehouse', 'Industrial Area, Lahore', 'Lahore', 'Bilal Sheikh', '+92-300-6789012', 'warehouse@homeessentials.local'),
            (4, 'Sports Galaxy Main', 'MM Alam Road, Lahore', 'Lahore', 'Faisal Iqbal', '+92-300-7890123', 'main@sportsgalaxy.local'),
            (5, 'Book Haven Central', 'Anarkali Bazaar, Lahore', 'Lahore', 'Dr. Amna Riaz', '+92-300-8901234', 'central@bookhaven.local'),
            (6, 'Food Express HQ', 'DHA Phase 5, Lahore', 'Lahore', 'Chef Kamran', '+92-300-9012345', 'hq@foodexpress.local')
            ON CONFLICT DO NOTHING;
        `);

        // ============================================
        // SEED PRODUCT CATEGORIES
        // ============================================
        logger.info('Seeding product categories...');
        await db.query(`
            INSERT INTO product_categories (name, description) VALUES
            ('Electronics', 'Electronic devices and gadgets'),
            ('Mobile Phones', 'Smartphones and accessories'),
            ('Laptops', 'Laptops and computer accessories'),
            ('Clothing', 'Apparel and fashion wear'),
            ('Men''s Clothing', 'Men''s fashion and apparel'),
            ('Women''s Clothing', 'Women''s fashion and apparel'),
            ('Home & Kitchen', 'Home appliances and kitchen items'),
            ('Furniture', 'Home and office furniture'),
            ('Sports', 'Sports equipment and gear'),
            ('Books', 'Books and publications'),
            ('Groceries', 'Food and grocery items'),
            ('Health & Beauty', 'Personal care products')
            ON CONFLICT DO NOTHING;
        `);

        // ============================================
        // SEED PRODUCTS
        // ============================================
        logger.info('Seeding products...');
        await db.query(`
            INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, stock_quantity, reorder_level) VALUES
            -- Electronics
            ('TECH-001', 'Samsung Galaxy S24 Ultra', 'Latest Samsung flagship smartphone', 2, 289999.00, 245000.00, 50, 10),
            ('TECH-002', 'iPhone 15 Pro Max', 'Apple flagship smartphone', 2, 449999.00, 380000.00, 35, 10),
            ('TECH-003', 'MacBook Pro 16"', 'Apple M3 Pro laptop', 3, 649999.00, 550000.00, 20, 5),
            ('TECH-004', 'Dell XPS 15', 'Premium Windows laptop', 3, 329999.00, 280000.00, 25, 5),
            ('TECH-005', 'Sony WH-1000XM5', 'Wireless noise canceling headphones', 1, 79999.00, 65000.00, 100, 20),
            ('TECH-006', 'iPad Pro 12.9"', 'Apple tablet with M2 chip', 1, 249999.00, 210000.00, 30, 8),
            ('TECH-007', 'Samsung 65" QLED TV', '4K Smart TV', 1, 299999.00, 250000.00, 15, 5),
            ('TECH-008', 'AirPods Pro 2', 'Apple wireless earbuds', 1, 49999.00, 40000.00, 150, 30),
            
            -- Fashion
            ('FASH-001', 'Premium Cotton Shirt', 'Formal cotton shirt', 5, 3999.00, 2000.00, 200, 40),
            ('FASH-002', 'Designer Lawn Suit', 'Women''s 3-piece lawn suit', 6, 8999.00, 4500.00, 150, 30),
            ('FASH-003', 'Leather Jacket', 'Genuine leather jacket', 5, 24999.00, 15000.00, 50, 10),
            ('FASH-004', 'Party Wear Dress', 'Women''s formal dress', 6, 15999.00, 8000.00, 75, 15),
            ('FASH-005', 'Casual Jeans', 'Men''s denim jeans', 5, 4999.00, 2500.00, 300, 50),
            ('FASH-006', 'Silk Saree', 'Premium silk saree', 6, 29999.00, 18000.00, 40, 10),
            
            -- Home & Kitchen
            ('HOME-001', 'L-Shaped Sofa Set', 'Modern living room sofa', 8, 149999.00, 90000.00, 10, 3),
            ('HOME-002', 'King Size Bed', 'Wooden bed with storage', 8, 89999.00, 55000.00, 15, 4),
            ('HOME-003', 'Dining Table Set', '6-seater dining set', 8, 69999.00, 42000.00, 12, 4),
            ('HOME-004', 'Microwave Oven', 'Convection microwave', 7, 29999.00, 20000.00, 40, 10),
            ('HOME-005', 'Air Conditioner 1.5 Ton', 'Inverter AC', 7, 119999.00, 85000.00, 25, 8),
            ('HOME-006', 'Refrigerator 500L', 'Double door refrigerator', 7, 159999.00, 110000.00, 20, 5),
            
            -- Sports
            ('SPRT-001', 'Cricket Bat (Kashmir Willow)', 'Professional cricket bat', 9, 8999.00, 5000.00, 100, 20),
            ('SPRT-002', 'Football (FIFA Approved)', 'Match quality football', 9, 4999.00, 2500.00, 80, 15),
            ('SPRT-003', 'Treadmill Pro', 'Electric treadmill', 9, 89999.00, 60000.00, 15, 5),
            ('SPRT-004', 'Gym Dumbbells Set', 'Adjustable dumbbells', 9, 24999.00, 15000.00, 30, 10),
            ('SPRT-005', 'Badminton Racket Pair', 'Professional rackets', 9, 5999.00, 3000.00, 60, 15),
            
            -- Books
            ('BOOK-001', 'Programming with Python', 'Complete Python guide', 10, 2499.00, 1200.00, 200, 50),
            ('BOOK-002', 'Business Management', 'MBA reference book', 10, 3999.00, 2000.00, 150, 30),
            ('BOOK-003', 'IELTS Preparation', 'Complete IELTS guide', 10, 2999.00, 1500.00, 300, 60),
            ('BOOK-004', 'Urdu Literature', 'Collection of Urdu poetry', 10, 1999.00, 900.00, 100, 25),
            
            -- Groceries
            ('GROC-001', 'Basmati Rice 5kg', 'Premium long grain rice', 11, 1299.00, 900.00, 500, 100),
            ('GROC-002', 'Olive Oil 1L', 'Extra virgin olive oil', 11, 1999.00, 1400.00, 200, 50),
            ('GROC-003', 'Milk Pack (12 pcs)', 'Full cream milk', 11, 2699.00, 2200.00, 300, 80),
            ('GROC-004', 'Cooking Oil 5L', 'Vegetable cooking oil', 11, 2499.00, 1900.00, 400, 100)
            ON CONFLICT (sku) DO NOTHING;
        `);

        // ============================================
        // LINK PRODUCTS TO WEBSITES
        // ============================================
        logger.info('Linking products to websites...');
        await db.query(`
            -- TechMart gets electronics
            INSERT INTO website_products (website_id, product_id, is_featured)
            SELECT 1, id, (id % 3 = 0) FROM products WHERE sku LIKE 'TECH%'
            ON CONFLICT DO NOTHING;
            
            -- Fashion Hub gets fashion
            INSERT INTO website_products (website_id, product_id, is_featured)
            SELECT 2, id, (id % 2 = 0) FROM products WHERE sku LIKE 'FASH%'
            ON CONFLICT DO NOTHING;
            
            -- Home Essentials gets home products
            INSERT INTO website_products (website_id, product_id, is_featured)
            SELECT 3, id, true FROM products WHERE sku LIKE 'HOME%'
            ON CONFLICT DO NOTHING;
            
            -- Sports Galaxy gets sports
            INSERT INTO website_products (website_id, product_id, is_featured)
            SELECT 4, id, true FROM products WHERE sku LIKE 'SPRT%'
            ON CONFLICT DO NOTHING;
            
            -- Book Haven gets books
            INSERT INTO website_products (website_id, product_id, is_featured)
            SELECT 5, id, true FROM products WHERE sku LIKE 'BOOK%'
            ON CONFLICT DO NOTHING;
            
            -- Food Express gets groceries
            INSERT INTO website_products (website_id, product_id, is_featured)
            SELECT 6, id, true FROM products WHERE sku LIKE 'GROC%'
            ON CONFLICT DO NOTHING;
        `);

        // ============================================
        // SEED DEMO CUSTOMERS
        // ============================================
        logger.info('Seeding demo customers...');
        await db.query(`
            INSERT INTO customers (email, phone, first_name, last_name, city) VALUES
            ('customer1@email.com', '+92-301-1111111', 'Ali', 'Ahmad', 'Lahore'),
            ('customer2@email.com', '+92-302-2222222', 'Fatima', 'Khan', 'Karachi'),
            ('customer3@email.com', '+92-303-3333333', 'Hassan', 'Malik', 'Islamabad'),
            ('customer4@email.com', '+92-304-4444444', 'Ayesha', 'Butt', 'Lahore'),
            ('customer5@email.com', '+92-305-5555555', 'Usman', 'Sheikh', 'Multan'),
            ('customer6@email.com', '+92-306-6666666', 'Zainab', 'Ali', 'Faisalabad'),
            ('customer7@email.com', '+92-307-7777777', 'Bilal', 'Hassan', 'Rawalpindi'),
            ('customer8@email.com', '+92-308-8888888', 'Mariam', 'Qureshi', 'Peshawar'),
            ('customer9@email.com', '+92-309-9999999', 'Kamran', 'Aziz', 'Sialkot'),
            ('customer10@email.com', '+92-310-0000000', 'Sana', 'Riaz', 'Gujranwala')
            ON CONFLICT DO NOTHING;
        `);

        // ============================================
        // SEED SYSTEM SETTINGS
        // ============================================
        logger.info('Seeding system settings...');
        await db.query(`
            INSERT INTO system_settings (setting_key, setting_value, description) VALUES
            ('tax_rate', '17', 'Default GST tax rate percentage'),
            ('currency', 'PKR', 'System currency'),
            ('currency_symbol', 'Rs.', 'Currency symbol for display'),
            ('simulation_enabled', 'true', 'Enable fake sales simulation'),
            ('simulation_interval', '60', 'Simulation interval in seconds'),
            ('company_name', 'Sales Analytics ERP', 'Company name for branding'),
            ('developer', 'Hammad Naeem', 'System developer')
            ON CONFLICT (setting_key) DO NOTHING;
        `);

        logger.info('Database seeding completed successfully!');

    } catch (error) {
        logger.error('Error seeding database:', error);
        throw error;
    }
}

module.exports = { seedDatabase };