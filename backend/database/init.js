/**
 * ============================================
 * Database Auto-Initialization
 * Made by Hammad Naeem
 * ============================================
 * 
 * This module handles automatic database setup:
 * - Creates database if not exists
 * - Creates all tables
 * - Creates indexes
 * - Creates triggers
 * - Creates stored procedures
 * - Seeds initial data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const { seedDatabase } = require('./seed');

/**
 * Create the database if it doesn't exist
 */
async function createDatabaseIfNotExists() {
    // Connect to default 'postgres' database first
    const adminPool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: 'postgres',
        user: config.database.user,
        password: config.database.password,
        connectionTimeoutMillis: 5000
    });

    try {
        // Check if database exists
        const checkResult = await adminPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [config.database.name]
        );

        if (checkResult.rows.length === 0) {
            logger.info(`Creating database: ${config.database.name}`);
            await adminPool.query(`CREATE DATABASE ${config.database.name}`);
            logger.info('Database created successfully!');
        } else {
            logger.info(`Database ${config.database.name} already exists`);
        }
    } catch (error) {
        logger.warn('Could not check/create database:', error.message);
        logger.warn('This may be expected if database already exists or PostgreSQL is not running');
        throw error;
    } finally {
        await adminPool.end();
    }
}

/**
 * Execute SQL file
 */
async function executeSQLFile(db, filename) {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf8');
        await db.query(sql);
        logger.info(`Executed: ${filename}`);
    } else {
        logger.warn(`SQL file not found: ${filename}`);
    }
}

/**
 * Create all database tables
 */
async function createTables(db) {
    logger.info('Creating database tables...');

    const schemaSQL = `
    -- ============================================
    -- Sales Analytics ERP Database Schema
    -- Made by Hammad Naeem
    -- ============================================

    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- ============================================
    -- ROLES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- USERS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- WEBSITES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS websites (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500),
        description TEXT,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        logo_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- SHOPS/BRANCHES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS shops (
        id SERIAL PRIMARY KEY,
        website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(500),
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Pakistan',
        manager_name VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- PRODUCT CATEGORIES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        parent_id INTEGER REFERENCES product_categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- PRODUCTS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES product_categories(id),
        unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
        cost_price DECIMAL(12, 2) DEFAULT 0 CHECK (cost_price >= 0),
        stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
        reorder_level INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        image_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- WEBSITE PRODUCTS (Many-to-Many)
    -- ============================================
    CREATE TABLE IF NOT EXISTS website_products (
        id SERIAL PRIMARY KEY,
        website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        custom_price DECIMAL(12, 2),
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(website_id, product_id)
    );

    -- ============================================
    -- CUSTOMERS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        phone VARCHAR(50),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Pakistan',
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- SALES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sale_number VARCHAR(50) UNIQUE NOT NULL,
        website_id INTEGER REFERENCES websites(id) ON DELETE SET NULL,
        shop_id INTEGER REFERENCES shops(id) ON DELETE SET NULL,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'cash',
        payment_status VARCHAR(50) DEFAULT 'completed',
        order_status VARCHAR(50) DEFAULT 'completed',
        notes TEXT,
        sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- SALE ITEMS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(12, 2) NOT NULL,
        discount_percent DECIMAL(5, 2) DEFAULT 0,
        line_total DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- AUDIT LOGS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGSERIAL PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        record_id VARCHAR(100),
        action VARCHAR(20) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        user_id UUID,
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- SALES ANALYTICS AGGREGATES TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS sales_hourly_stats (
        id SERIAL PRIMARY KEY,
        website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
        shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
        stat_date DATE NOT NULL,
        stat_hour INTEGER NOT NULL CHECK (stat_hour >= 0 AND stat_hour < 24),
        total_sales INTEGER DEFAULT 0,
        total_revenue DECIMAL(15, 2) DEFAULT 0,
        total_items_sold INTEGER DEFAULT 0,
        average_order_value DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(website_id, shop_id, stat_date, stat_hour)
    );

    -- ============================================
    -- SALES DAILY STATS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS sales_daily_stats (
        id SERIAL PRIMARY KEY,
        website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
        stat_date DATE NOT NULL,
        total_sales INTEGER DEFAULT 0,
        total_revenue DECIMAL(15, 2) DEFAULT 0,
        total_items_sold INTEGER DEFAULT 0,
        unique_customers INTEGER DEFAULT 0,
        average_order_value DECIMAL(12, 2) DEFAULT 0,
        top_product_id INTEGER REFERENCES products(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(website_id, stat_date)
    );

    -- ============================================
    -- SYSTEM SETTINGS TABLE
    -- ============================================
    CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- INDEXES FOR PERFORMANCE
    -- ============================================
    
    -- Sales indexes
    CREATE INDEX IF NOT EXISTS idx_sales_website_id ON sales(website_id);
    CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);
    CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
    CREATE INDEX IF NOT EXISTS idx_sales_date_website ON sales(sale_date, website_id);
    CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

    -- Sale items indexes
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
    CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

    -- Products indexes
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

    -- Users indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

    -- Audit logs indexes
    CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

    -- Stats indexes
    CREATE INDEX IF NOT EXISTS idx_hourly_stats_date ON sales_hourly_stats(stat_date);
    CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON sales_daily_stats(stat_date);
    `;

    await db.query(schemaSQL);
    logger.info('Tables created successfully!');
}

/**
 * Create database triggers
 */
async function createTriggers(db) {
    logger.info('Creating database triggers...');

    const triggersSQL = `
    -- ============================================
    -- Triggers for Sales Analytics ERP
    -- Made by Hammad Naeem
    -- ============================================

    -- ============================================
    -- UPDATED_AT TRIGGER FUNCTION
    -- ============================================
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Apply updated_at trigger to tables
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
    CREATE TRIGGER update_sales_updated_at
        BEFORE UPDATE ON sales
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
    CREATE TRIGGER update_websites_updated_at
        BEFORE UPDATE ON websites
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_shops_updated_at ON shops;
    CREATE TRIGGER update_shops_updated_at
        BEFORE UPDATE ON shops
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- ============================================
    -- AUDIT LOG TRIGGER FUNCTION
    -- ============================================
    CREATE OR REPLACE FUNCTION audit_log_trigger_function()
    RETURNS TRIGGER AS $$
    DECLARE
        record_id_value VARCHAR(100);
        old_data JSONB;
        new_data JSONB;
    BEGIN
        -- Get record ID
        IF TG_OP = 'DELETE' THEN
            record_id_value := OLD.id::VARCHAR;
            old_data := to_jsonb(OLD);
            new_data := NULL;
        ELSIF TG_OP = 'UPDATE' THEN
            record_id_value := NEW.id::VARCHAR;
            old_data := to_jsonb(OLD);
            new_data := to_jsonb(NEW);
        ELSE
            record_id_value := NEW.id::VARCHAR;
            old_data := NULL;
            new_data := to_jsonb(NEW);
        END IF;

        -- Insert audit log
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, record_id_value, TG_OP, old_data, new_data);

        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Apply audit triggers
    DROP TRIGGER IF EXISTS audit_users ON users;
    CREATE TRIGGER audit_users
        AFTER INSERT OR UPDATE OR DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION audit_log_trigger_function();

    DROP TRIGGER IF EXISTS audit_sales ON sales;
    CREATE TRIGGER audit_sales
        AFTER INSERT OR UPDATE OR DELETE ON sales
        FOR EACH ROW EXECUTE FUNCTION audit_log_trigger_function();

    DROP TRIGGER IF EXISTS audit_products ON products;
    CREATE TRIGGER audit_products
        AFTER INSERT OR UPDATE OR DELETE ON products
        FOR EACH ROW EXECUTE FUNCTION audit_log_trigger_function();

    -- ============================================
    -- STOCK UPDATE TRIGGER (On Sale Item Insert)
    -- ============================================
    CREATE OR REPLACE FUNCTION update_stock_on_sale()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Decrease stock when sale item is created
        UPDATE products
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_stock_on_sale ON sale_items;
    CREATE TRIGGER trigger_update_stock_on_sale
        AFTER INSERT ON sale_items
        FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

    -- ============================================
    -- CUSTOMER STATS UPDATE TRIGGER
    -- ============================================
    CREATE OR REPLACE FUNCTION update_customer_stats()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.customer_id IS NOT NULL THEN
            UPDATE customers
            SET 
                total_orders = total_orders + 1,
                total_spent = total_spent + NEW.total_amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.customer_id;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_customer_stats ON sales;
    CREATE TRIGGER trigger_update_customer_stats
        AFTER INSERT ON sales
        FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

    -- ============================================
    -- SALE NUMBER GENERATION TRIGGER
    -- ============================================
    CREATE OR REPLACE FUNCTION generate_sale_number()
    RETURNS TRIGGER AS $$
    DECLARE
        new_number VARCHAR(50);
        date_prefix VARCHAR(8);
        seq_number INTEGER;
    BEGIN
        IF NEW.sale_number IS NULL OR NEW.sale_number = '' THEN
            date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
            
            SELECT COALESCE(MAX(
                CAST(SUBSTRING(sale_number FROM 10) AS INTEGER)
            ), 0) + 1
            INTO seq_number
            FROM sales
            WHERE sale_number LIKE 'S' || date_prefix || '%';
            
            NEW.sale_number := 'S' || date_prefix || LPAD(seq_number::TEXT, 5, '0');
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_generate_sale_number ON sales;
    CREATE TRIGGER trigger_generate_sale_number
        BEFORE INSERT ON sales
        FOR EACH ROW EXECUTE FUNCTION generate_sale_number();
    `;

    await db.query(triggersSQL);
    logger.info('Triggers created successfully!');
}

/**
 * Create stored procedures
 */
async function createStoredProcedures(db) {
    logger.info('Creating stored procedures...');

    const proceduresSQL = `
    -- ============================================
    -- Stored Procedures for Sales Analytics ERP
    -- Made by Hammad Naeem
    -- ============================================

    -- ============================================
    -- PROCEDURE: Create Sale with Items (Transaction)
    -- ============================================
    CREATE OR REPLACE FUNCTION create_sale_with_items(
        p_website_id INTEGER,
        p_shop_id INTEGER,
        p_customer_id INTEGER,
        p_user_id UUID,
        p_payment_method VARCHAR,
        p_items JSONB,
        p_notes TEXT DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
        v_sale_id UUID;
        v_subtotal DECIMAL(15, 2) := 0;
        v_total_amount DECIMAL(15, 2) := 0;
        v_tax_amount DECIMAL(15, 2) := 0;
        v_item JSONB;
        v_product_price DECIMAL(12, 2);
        v_line_total DECIMAL(15, 2);
        v_product_name VARCHAR(255);
    BEGIN
        -- Calculate totals from items
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            SELECT unit_price, name INTO v_product_price, v_product_name
            FROM products WHERE id = (v_item->>'product_id')::INTEGER;
            
            IF v_product_price IS NULL THEN
                RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
            END IF;
            
            v_line_total := v_product_price * (v_item->>'quantity')::INTEGER;
            v_subtotal := v_subtotal + v_line_total;
        END LOOP;

        -- Calculate tax (assuming 17% GST for Pakistan)
        v_tax_amount := v_subtotal * 0.17;
        v_total_amount := v_subtotal + v_tax_amount;

        -- Create sale record
        INSERT INTO sales (
            website_id, shop_id, customer_id, user_id,
            subtotal, tax_amount, total_amount,
            payment_method, notes
        )
        VALUES (
            p_website_id, p_shop_id, p_customer_id, p_user_id,
            v_subtotal, v_tax_amount, v_total_amount,
            p_payment_method, p_notes
        )
        RETURNING id INTO v_sale_id;

        -- Create sale items
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            SELECT unit_price, name INTO v_product_price, v_product_name
            FROM products WHERE id = (v_item->>'product_id')::INTEGER;
            
            v_line_total := v_product_price * (v_item->>'quantity')::INTEGER;
            
            INSERT INTO sale_items (
                sale_id, product_id, product_name, quantity,
                unit_price, line_total
            )
            VALUES (
                v_sale_id,
                (v_item->>'product_id')::INTEGER,
                v_product_name,
                (v_item->>'quantity')::INTEGER,
                v_product_price,
                v_line_total
            );
        END LOOP;

        RETURN v_sale_id;
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================
    -- PROCEDURE: Get Sales Statistics by Period
    -- ============================================
    CREATE OR REPLACE FUNCTION get_sales_statistics(
        p_website_id INTEGER DEFAULT NULL,
        p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
        p_end_date DATE DEFAULT CURRENT_DATE
    )
    RETURNS TABLE (
        total_sales BIGINT,
        total_revenue DECIMAL(15, 2),
        average_order_value DECIMAL(12, 2),
        total_items_sold BIGINT,
        unique_customers BIGINT
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            COUNT(DISTINCT s.id)::BIGINT as total_sales,
            COALESCE(SUM(s.total_amount), 0)::DECIMAL(15, 2) as total_revenue,
            COALESCE(AVG(s.total_amount), 0)::DECIMAL(12, 2) as average_order_value,
            COALESCE(SUM(si.quantity), 0)::BIGINT as total_items_sold,
            COUNT(DISTINCT s.customer_id)::BIGINT as unique_customers
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE s.sale_date::DATE BETWEEN p_start_date AND p_end_date
        AND (p_website_id IS NULL OR s.website_id = p_website_id);
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================
    -- PROCEDURE: Get Hourly Sales Pattern
    -- ============================================
    CREATE OR REPLACE FUNCTION get_hourly_sales_pattern(
        p_website_id INTEGER DEFAULT NULL,
        p_date DATE DEFAULT CURRENT_DATE
    )
    RETURNS TABLE (
        hour_of_day INTEGER,
        sale_count BIGINT,
        revenue DECIMAL(15, 2)
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            EXTRACT(HOUR FROM sale_date)::INTEGER as hour_of_day,
            COUNT(*)::BIGINT as sale_count,
            COALESCE(SUM(total_amount), 0)::DECIMAL(15, 2) as revenue
        FROM sales
        WHERE sale_date::DATE = p_date
        AND (p_website_id IS NULL OR website_id = p_website_id)
        GROUP BY EXTRACT(HOUR FROM sale_date)
        ORDER BY hour_of_day;
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================
    -- PROCEDURE: Get Top Selling Products
    -- ============================================
    CREATE OR REPLACE FUNCTION get_top_selling_products(
        p_limit INTEGER DEFAULT 10,
        p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
        p_end_date DATE DEFAULT CURRENT_DATE
    )
    RETURNS TABLE (
        product_id INTEGER,
        product_name VARCHAR,
        total_quantity BIGINT,
        total_revenue DECIMAL(15, 2)
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            p.id as product_id,
            p.name as product_name,
            SUM(si.quantity)::BIGINT as total_quantity,
            SUM(si.line_total)::DECIMAL(15, 2) as total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.sale_date::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY p.id, p.name
        ORDER BY total_quantity DESC
        LIMIT p_limit;
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================
    -- PROCEDURE: Get Website Performance Comparison
    -- ============================================
    CREATE OR REPLACE FUNCTION get_website_performance(
        p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
        p_end_date DATE DEFAULT CURRENT_DATE
    )
    RETURNS TABLE (
        website_id INTEGER,
        website_name VARCHAR,
        total_sales BIGINT,
        total_revenue DECIMAL(15, 2),
        average_order_value DECIMAL(12, 2),
        revenue_percentage DECIMAL(5, 2)
    ) AS $$
    DECLARE
        v_total_revenue DECIMAL(15, 2);
    BEGIN
        -- Get total revenue for percentage calculation
        SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
        FROM sales
        WHERE sale_date::DATE BETWEEN p_start_date AND p_end_date;

        RETURN QUERY
        SELECT 
            w.id as website_id,
            w.name::VARCHAR as website_name,
            COUNT(s.id)::BIGINT as total_sales,
            COALESCE(SUM(s.total_amount), 0)::DECIMAL(15, 2) as total_revenue,
            COALESCE(AVG(s.total_amount), 0)::DECIMAL(12, 2) as average_order_value,
            CASE 
                WHEN v_total_revenue > 0 
                THEN (COALESCE(SUM(s.total_amount), 0) / v_total_revenue * 100)::DECIMAL(5, 2)
                ELSE 0
            END as revenue_percentage
        FROM websites w
        LEFT JOIN sales s ON w.id = s.website_id 
            AND s.sale_date::DATE BETWEEN p_start_date AND p_end_date
        WHERE w.is_active = true
        GROUP BY w.id, w.name
        ORDER BY total_revenue DESC;
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================
    -- PROCEDURE: Aggregate Hourly Statistics
    -- ============================================
    CREATE OR REPLACE FUNCTION aggregate_hourly_stats()
    RETURNS VOID AS $$
    BEGIN
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
            updated_at = CURRENT_TIMESTAMP;
    END;
    $$ LANGUAGE plpgsql;
    `;

    await db.query(proceduresSQL);
    logger.info('Stored procedures created successfully!');
}

/**
 * Create views
 */
async function createViews(db) {
    logger.info('Creating database views...');

    const viewsSQL = `
    -- ============================================
    -- Views for Sales Analytics ERP
    -- Made by Hammad Naeem
    -- ============================================

    -- Today's sales summary view
    CREATE OR REPLACE VIEW v_today_sales_summary AS
    SELECT 
        w.id as website_id,
        w.name as website_name,
        COUNT(s.id) as today_sales_count,
        COALESCE(SUM(s.total_amount), 0) as today_revenue,
        COALESCE(AVG(s.total_amount), 0) as average_order_value
    FROM websites w
    LEFT JOIN sales s ON w.id = s.website_id 
        AND s.sale_date::DATE = CURRENT_DATE
    WHERE w.is_active = true
    GROUP BY w.id, w.name
    ORDER BY today_revenue DESC;

    -- Recent sales view (last 100)
    CREATE OR REPLACE VIEW v_recent_sales AS
    SELECT 
        s.id,
        s.sale_number,
        w.name as website_name,
        sh.name as shop_name,
        s.total_amount,
        s.payment_method,
        s.payment_status,
        s.sale_date,
        (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
    FROM sales s
    LEFT JOIN websites w ON s.website_id = w.id
    LEFT JOIN shops sh ON s.shop_id = sh.id
    ORDER BY s.sale_date DESC
    LIMIT 100;

    -- Low stock products view
    CREATE OR REPLACE VIEW v_low_stock_products AS
    SELECT 
        id,
        sku,
        name,
        stock_quantity,
        reorder_level,
        (reorder_level - stock_quantity) as shortage
    FROM products
    WHERE stock_quantity < reorder_level
    AND is_active = true
    ORDER BY shortage DESC;

    -- Website daily performance view
    CREATE OR REPLACE VIEW v_website_daily_performance AS
    SELECT 
        w.id as website_id,
        w.name as website_name,
        s.sale_date::DATE as sale_date,
        COUNT(s.id) as total_orders,
        SUM(s.total_amount) as total_revenue,
        AVG(s.total_amount) as avg_order_value
    FROM websites w
    LEFT JOIN sales s ON w.id = s.website_id
    WHERE s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY w.id, w.name, s.sale_date::DATE
    ORDER BY s.sale_date::DATE DESC, total_revenue DESC;
    `;

    await db.query(viewsSQL);
    logger.info('Views created successfully!');
}

/**
 * Main initialization function
 */
async function initializeDatabase() {
    try {
        // Step 1: Create database if it doesn't exist
        await createDatabaseIfNotExists();

        // Step 2: Connect to the newly created database
        const db = require('./database');
        await db.testConnection();

        // Step 3: Create tables
        await createTables(db);

        // Step 4: Create triggers
        await createTriggers(db);

        // Step 5: Create stored procedures
        await createStoredProcedures(db);

        // Step 6: Create views
        await createViews(db);

        // Step 7: Seed initial data
        await seedDatabase(db);

        logger.info('============================================');
        logger.info('Database initialization complete!');
        logger.info('Made by Hammad Naeem');
        logger.info('============================================');

    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

/**
 * Master database initializer
 * This is what server.js will call
 */
async function initializeDatabase() {
    const dbPool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        connectionTimeoutMillis: 5000
    });

    try {
        logger.info('Starting database initialization process...');

        // 1️⃣ Create DB if needed
        try {
            await createDatabaseIfNotExists();
        } catch (err) {
            logger.warn('Database creation check failed:', err.message);
        }

        // Test connection to the target database
        try {
            await dbPool.query('SELECT NOW()');
            logger.info('✅ Database connection successful');
        } catch (connError) {
            logger.warn('Cannot connect to database:', connError.message);
            throw connError;
        }

        // 2️⃣ Create tables
        await createTables(dbPool);

        // 3️⃣ Create triggers
        await createTriggers(dbPool);

        // 4️⃣ Create stored procedures
        await createStoredProcedures(dbPool);

        // 5️⃣ Create views
        await createViews(dbPool);

        // 6️⃣ Seed initial data
        await seedDatabase(dbPool);

        logger.info('✅ Database initialization completed successfully');
    } catch (err) {
        logger.error('❌ Database initialization failed', err.message);
        throw err;
    } finally {
        await dbPool.end();
    }
}

module.exports = { initializeDatabase };
