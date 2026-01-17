# Sales Analytics ERP System

**A comprehensive, real-time multi-website sales analytics and enterprise resource planning platform.**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Database Design](#database-design)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Python Analytics Engine](#python-analytics-engine)
- [Common Issues & Fixes](#common-issues--fixes)
- [Future Improvements](#future-improvements)
- [Security & Best Practices](#security--best-practices)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [Author](#author)

---

## Project Overview

The **Sales Analytics ERP System** is an enterprise-grade, full-stack solution designed to manage and analyze sales data across multiple e-commerce websites and physical retail stores in real-time. This system demonstrates advanced software engineering principles including ACID transaction handling, role-based access control, real-time updates via WebSockets, and scalable database design.

### Real-World Use Case

Business owners managing multiple online stores and brick-and-mortar shops can use this platform to:
- Monitor sales performance across all channels in real-time
- Track inventory levels and receive low-stock alerts
- Analyze revenue trends and customer behavior
- Manage user roles and permissions
- Access complete audit logs for compliance

### Target Users

- **E-commerce business owners** managing multiple online platforms
- **Retail managers** overseeing multiple store locations
- **Analytics teams** requiring detailed sales insights
- **System administrators** managing user access and permissions

---
Real-Time Sales Alerts - Quick Guide
🎯 How to Test Real-Time Alerts
Step 1: Start All Services
# Terminal 1 - Backend
cd backend && npm start

<<<<<<< HEAD
# Terminal 2 - Frontend  
cd frontend && npm start

# Terminal 3 - Analytics (optional)
cd analytics-engine && python main.py

Step 2: Open Two Browser Windows
1.	Window 1: Dashboard (http://localhost:3000)
2.	Window 2: Sales Management (http://localhost:3000/sales)
Step 3: Create a Sale
1.	Go to Sales page (Window 2)
2.	Click "Create Sale" button
3.	Select a Website
4.	Select Products and enter Quantity
5.	Click "Create Sale"
Step 4: See Real-Time Alert
✅ The Dashboard in Window 1 will immediately show:
·	🔔 Toast notification: "🎉 New Sale! Rs. XXXX.XX received just now"
·	📊 Dashboard stats update automatically
·	💹 Total sales count increases in real-time

📱 What Happens Behind the Scenes
Frontend
1.	User creates a sale via the Create Sale form
2.	Sale is sent to backend API: POST /api/sales
3.	Frontend awaits response with sale confirmation
Backend
1.	Sale is inserted into database with transaction
2.	Socket.io emits event: new_sale_alert
3.	Event includes: sale ID, amount, product name, timestamp
Socket.io Connection
1.	All connected dashboard clients listen for new_sale_alert
2.	Event received instantly via WebSocket
3.	Toast notification displayed
4.	Dashboard stats refreshed automatically

🔧 File Structure
frontend/
├── src/
│   ├── components/
│   │   ├── sales/
│   │   │   ├── SalesList.jsx (Create Sale button added)
│   │   │   └── CreateSale.jsx (NEW - Sale form modal)
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx (Listens for alerts)
│   │   └── common/
│   │       └── Toast.jsx (Notification display)
│   └── contexts/
│       └── SocketContext.js (WebSocket connection)
│
backend/
├── server.js (Socket.io initialized)
├── services/
│   └── socketService.js (Emit events)
├── controllers/
│   └── sale.controller.js (Emits on sale creation)
└── routes/
    └── sale.routes.js



🔌 Socket.io Events
Frontend Emits
socket.emit('join_dashboard')   // Join dashboard room
socket.emit('leave_dashboard')  // Leave dashboard room

Backend Emits
io.to('dashboard').emit('new_sale_alert', saleData)
io.to('dashboard').emit('stats_update', statsData)


✨ Features Included
✅ Real-time sale creation form

✅ Product selection with live pricing

✅ Automatic tax calculation (17% GST)

✅ Add/Remove multiple items

✅ Real-time total calculation

✅ Toast notification on new sales

✅ Dashboard auto-refresh

✅ Socket.io WebSocket connection

✅ Error handling and validation

✅ Responsive modal design

🐛 Troubleshooting
Toast notification not appearing?
·	Check browser console for Socket.io connection errors
·	Verify backend server is running
·	Check Network tab in DevTools for WebSocket
Dashboard not updating?
·	Verify Socket.io connection: io.isConnected()
·	Check Console for new_sale_alert events
·	Ensure SocketProvider wraps App component
Sale not creating?
·	Verify website and products are available in database
·	Check backend logs for database errors
·	Ensure JWT token is valid

📊 Demo Credentials
·	Email: admin@saleserp.com
·	Password: admin123

Made by Hammad Naeem - 2026
=======
## Key Features

### Backend Features

✅ **Multi-Website Management** - Manage unlimited e-commerce websites and physical shops from a single dashboard  
✅ **Real-Time Analytics** - Live sales monitoring with minute-by-minute data refresh via WebSockets  
✅ **Role-Based Access Control (RBAC)** - Three-tier permission system: Admin, Manager, Viewer  
✅ **ACID Transactions** - Guaranteed data consistency for all sales operations  
✅ **Automatic Database Initialization** - Creates schema, tables, indexes, and triggers automatically  
✅ **Audit Logging** - Complete tracking of all changes with user and timestamp information  
✅ **Sales Management** - Create, update, and track sales with line-item details  
✅ **Inventory Management** - Product catalog with stock tracking and reorder levels  
✅ **Customer Management** - Track customer information and purchase history  
✅ **JWT Authentication** - Secure token-based authentication with configurable expiration  
✅ **Comprehensive Error Handling** - Standardized error responses with meaningful messages  

### Frontend Features

✅ **Interactive Dashboard** - Real-time sales statistics, revenue cards, and live counters  
✅ **WebSocket Integration** - Instant notifications for new sales across all connected clients  
✅ **Sales Management UI** - Create and view sales with product selection and quantity input  
✅ **Product Inventory** - Browse products, check stock levels, and manage inventory  
✅ **Website Management** - View and manage multiple e-commerce websites  
✅ **Admin Dashboard** - Advanced features for system administrators  
✅ **Role-Based Rendering** - UI components adapt based on user permissions  
✅ **Responsive Design** - Mobile-friendly interface using modern CSS  
✅ **Toast Notifications** - Real-time alerts for user actions and events  
✅ **Protected Routes** - Authentication guards on sensitive pages  

### Analytics Engine Features

✅ **Automated Sales Simulation** - Generates realistic sales data using Python/Faker  
✅ **Scheduled Jobs** - Background tasks for aggregation and stock replenishment  
✅ **Real-Time Statistics** - Computes hourly and daily aggregated metrics  
✅ **Low Stock Management** - Automatic alerts and replenishment suggestions  

---

## Technology Stack

### Frontend
- **React 18.2** - UI component framework
- **React Router v6** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **Socket.io Client** - Real-time WebSocket communication
- **Recharts** - Data visualization and charts
- **Lucide React** - Icon library
- **Date-fns** - Date utility functions
- **React Scripts 5.0** - Create React App build tools

### Backend
- **Node.js & Express 4.18** - Web application framework
- **PostgreSQL 12+** - Relational database management system
- **Socket.io 4.8** - Real-time bidirectional communication
- **JWT (jsonwebtoken 9.0)** - Token-based authentication
- **bcryptjs** - Password hashing and encryption
- **Morgan** - HTTP request logging
- **Helmet** - Security headers middleware
- **CORS** - Cross-origin resource sharing
- **Express Validator** - Input validation and sanitization
- **UUID** - Unique identifier generation

### Analytics Engine
- **Python 3.8+** - Programming language
- **psycopg2** - PostgreSQL adapter for Python
- **Faker** - Realistic fake data generation
- **Schedule** - Job scheduling and automation
- **NumPy** - Numerical computing
- **python-dotenv** - Environment variable management

### Database
- **PostgreSQL 12+** - Relational DBMS with JSON/UUID support
- **Stored Procedures** - Advanced query optimization
- **Database Triggers** - Automated audit logging and data validation

### DevOps & Tools
- **npm** - JavaScript package manager
- **pip** - Python package manager
- **Nodemon** - Development auto-reload
- **Concurrently** - Run multiple processes in parallel

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Layer                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Application (Port 3001)                           │  │
│  │  ├─ Dashboard (Real-time stats)                          │  │
│  │  ├─ Sales Management                                    │  │
│  │  ├─ Product & Inventory                                 │  │
│  │  ├─ Website Management                                  │  │
│  │  └─ Admin Panel                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    ┌─────────┴──────────┐                       │
│          HTTP API  │  WebSocket (Real-  │                       │
│          Requests  │   time Updates)    │                       │
│                    └─────────┬──────────┘                       │
└────────────────────────────────┼──────────────────────────────┘
                                 │
┌────────────────────────────────┼──────────────────────────────┐
│                  Backend Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Express.js Server (Port 5000)                           │ │
│  │  ├─ REST API Routes                                      │ │
│  │  │  ├─ /api/auth (Authentication)                       │ │
│  │  │  ├─ /api/users (User Management)                     │ │
│  │  │  ├─ /api/sales (Sales CRUD)                          │ │
│  │  │  ├─ /api/products (Inventory)                        │ │
│  │  │  ├─ /api/websites (Multi-site Mgmt)                  │ │
│  │  │  ├─ /api/shops (Branch Locations)                    │ │
│  │  │  └─ /api/analytics (Dashboard Data)                  │ │
│  │  ├─ Socket.io Server (WebSocket Handler)                │ │
│  │  ├─ Middleware (Auth, RBAC, Error Handling)             │ │
│  │  └─ Utilities (Validation, Logging)                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                   ┌──────────┴──────────┐                      │
│                   │                     │                      │
└───────────────────┼─────────────────────┼──────────────────────┘
                    │                     │
         ┌──────────▼─┐        ┌──────────▼─────┐
         │ PostgreSQL │        │ Python Engine  │
         │ Database   │        │ (Port 5000)    │
         │            │        │                │
         │ ├─ Roles   │        │ ├─ Sales Gen   │
         │ ├─ Users   │        │ ├─ Analytics   │
         │ ├─ Products│        │ └─ Scheduling  │
         │ ├─ Sales   │        └────────────────┘
         │ ├─ Shops   │
         │ └─ Audit   │
         │   Logs     │
         └────────────┘
```

**Communication Flow:**
1. **Client → Backend**: React app sends HTTP requests (REST) and establishes WebSocket connection
2. **Backend → Database**: Node.js server queries PostgreSQL using prepared statements
3. **Backend → Client**: Returns JSON responses and emits real-time events via Socket.io
4. **Python Engine**: Runs background jobs, generates sales data, updates aggregations
5. **All Components**: Access shared PostgreSQL database for persistent data

---

## Folder Structure

```
sales-analytics-er-11/
├── backend/                          # Node.js Express backend
│   ├── server.js                     # Main entry point
│   ├── config/
│   │   ├── config.js                 # Environment configuration
│   │   └── database.js               # PostgreSQL connection pool
│   ├── controllers/                  # Route handlers
│   │   ├── auth.controller.js        # Authentication logic
│   │   ├── analytics.controller.js   # Dashboard/stats endpoints
│   │   ├── sale.controller.js        # Sales management
│   │   ├── product.controller.js     # Product/inventory
│   │   ├── user.controller.js        # User management
│   │   ├── shop.controller.js        # Shop/branch management
│   │   └── website.controller.js     # Website management
│   ├── routes/                       # API route definitions
│   │   ├── auth.routes.js
│   │   ├── sales.routes.js
│   │   ├── products.routes.js
│   │   ├── analytics.routes.js
│   │   └── ... (other routes)
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                   # JWT authentication
│   │   ├── rbac.js                   # Role-based access control
│   │   └── errorHandler.js           # Global error handling
│   ├── models/                       # Data models (currently lean)
│   ├── services/                     # Business logic
│   │   ├── auth.service.js
│   │   ├── analytics.service.js
│   │   ├── sale.service.js
│   │   └── socketService.js
│   ├── database/                     # Database scripts
│   │   ├── init.js                   # Auto-initialization (schema, data)
│   │   ├── seed.js                   # Database seeding
│   │   ├── schema.sql                # Schema definitions
│   │   ├── triggers.sql              # Trigger definitions
│   │   └── procedures.sql            # Stored procedures
│   ├── utils/
│   │   ├── helpers.js                # Utility functions
│   │   ├── validators.js             # Input validation rules
│   │   └── logger.js                 # Logging utility
│   ├── package.json
│   └── .env                          # Environment variables (not in repo)
│
├── frontend/                         # React frontend
│   ├── public/
│   │   └── index.html                # HTML entry point
│   ├── src/
│   │   ├── App.js                    # Main component
│   │   ├── index.js                  # React DOM render
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx         # Login page
│   │   │   │   └── ProtectedRoute.jsx # Route protection
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   │   ├── SalesChart.jsx    # Sales visualization
│   │   │   │   ├── RevenueCard.jsx   # Revenue display
│   │   │   │   └── LiveSalesCounter.jsx
│   │   │   ├── sales/
│   │   │   │   ├── CreateSale.jsx    # Sale creation form
│   │   │   │   ├── SalesList.jsx     # Sales listing
│   │   │   │   └── SaleDetails.jsx
│   │   │   ├── products/
│   │   │   │   └── ProductsList.jsx  # Product management
│   │   │   ├── websites/
│   │   │   │   └── WebsitesList.jsx  # Website listing
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── InventoryManager.jsx
│   │   │   │   └── SalesControl.jsx
│   │   │   └── common/
│   │   │       ├── Header.jsx        # Navigation header
│   │   │       ├── Sidebar.jsx       # Side navigation
│   │   │       ├── Footer.jsx
│   │   │       ├── Loading.jsx       # Loading indicator
│   │   │       └── Toast.jsx         # Notifications
│   │   ├── contexts/
│   │   │   ├── AuthContext.js        # Auth state management
│   │   │   └── SocketContext.js      # WebSocket connection
│   │   ├── hooks/
│   │   │   ├── useAuth.js            # Auth custom hook
│   │   │   └── useApi.js             # API request hook
│   │   ├── services/
│   │   │   └── api.js                # Centralized API client
│   │   ├── utils/
│   │   │   └── formatters.js         # Currency/number formatting
│   │   └── styles/
│   │       └── main.css              # Global styles
│   ├── package.json
│   └── .env (created via npm start)
│
├── analytics-engine/                 # Python analytics service
│   ├── main.py                       # Entry point
│   ├── requirements.txt               # Python dependencies
│   ├── analytics/
│   │   ├── aggregations.py           # Statistical aggregations
│   │   ├── realtime.py               # Real-time calculations
│   │   └── reports.py                # Report generation
│   ├── simulation/
│   │   ├── sales_generator.py        # Fake sales data
│   │   └── patterns.py               # Sales patterns
│   ├── database/
│   │   └── connection.py             # DB connection
│   ├── config/
│   │   └── settings.py               # Configuration
│   └── utils/
│       └── helpers.py                # Utilities
│
├── docs/                             # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── ER_DIAGRAM.md
│   └── PROJECT_DOCUMENTATION.md
│
├── logs/                             # Application logs
├── package.json                      # Root package file
├── .env                              # Environment variables (IGNORED BY GIT)
├── .env.example                      # Example env template
├── README.md                         # This file
├── REALTIME_ALERTS_GUIDE.md         # WebSocket testing guide
└── .gitignore                        # Git ignore rules
```

---

## Database Design

### Database Name
```
sales_analytics_erp
```

### Core Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| **roles** | User permission levels | Referenced by users |
| **users** | System users/accounts | FK: role_id |
| **websites** | E-commerce websites | PK: id |
| **shops** | Physical store locations | FK: website_id |
| **product_categories** | Product classification | Self-referencing (parent_id) |
| **products** | Product catalog | FK: category_id |
| **website_products** | Many-to-many mapping | FK: website_id, product_id |
| **customers** | Customer information | Tracked by sales |
| **sales** | Transaction records | FK: website_id, shop_id, customer_id, user_id |
| **sale_items** | Individual sale line items | FK: sale_id, product_id |
| **audit_logs** | Change tracking | Tracks all modifications |
| **sales_hourly_stats** | 1-hour aggregations | FK: website_id, shop_id |
| **sales_daily_stats** | Daily aggregations | FK: website_id |

### Key Design Features

✅ **UUID for Users** - Globally unique, cryptographically secure identifiers  
✅ **ACID Compliance** - All transactions maintain data integrity  
✅ **Foreign Keys** - Referential integrity with CASCADE/SET NULL options  
✅ **CHECK Constraints** - Data validation at database level (e.g., prices ≥ 0)  
✅ **JSONB Support** - Flexible storage for permissions and audit data  
✅ **Timestamps** - All records track creation and modification times  
✅ **Indexes** - Optimized queries on frequently accessed columns  
✅ **Triggers** - Automatic audit logging and data synchronization  

### Relationships

```
Roles ◄─────── Users
                  │
                  ├──────────► Sales ◄─────────────────┐
                  │               │                    │
                  │               ├─► Sale_Items ◄─────┤─► Products
                  │               │                    │      │
                  │               └──────────────────► Customers
                  │
Websites ◄─────┬──────────────────────┐
        │      │                      │
        └─► Shops                     │
             │                        │
             └─► Sales (shop_id)      │
                                      │
                      Website_Products ◄──┘
                             │
                             └─► Products
                                      │
                            Product_Categories
```

### Auto-Initialization

The system automatically creates all tables, indexes, triggers, and stored procedures on first run. See [Database Initialization](#installation--setup) section for details.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Database Configuration

```env
# PostgreSQL Connection
DB_HOST=localhost              # Database server hostname
DB_PORT=5432                   # PostgreSQL default port
DB_NAME=sales_analytics_erp    # Database name (auto-created)
DB_USER=postgres               # PostgreSQL username
DB_PASSWORD=your_password      # PostgreSQL password
```

### Server Configuration

```env
# Backend Server
NODE_ENV=development           # development | production
PORT=5000                      # Server port
```

### Authentication & Security

```env
# JWT Token Configuration
JWT_SECRET=your_super_secret_key_min_32_characters
JWT_EXPIRES_IN=24h             # Token expiration time
```

### Frontend Configuration

```env
# Frontend API Endpoint
REACT_APP_API_URL=http://localhost:5000/api
```

### Analytics Engine

```env
# Python Analytics Engine
ENABLE_SIMULATION=true         # Enable fake data generation
SIMULATION_INTERVAL_SECONDS=60 # Generate data every 60 seconds
```

### Example `.env` File

See [.env.example](.env.example) for a complete template.

---

## Installation & Setup

### Prerequisites

- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/sales-analytics-er-11.git
cd sales-analytics-er-11
```

### Step 2: Configure PostgreSQL

**On Linux/Mac:**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS with Homebrew
# OR
sudo systemctl start postgresql # Linux (Ubuntu/Debian)

# Login to PostgreSQL
psql -U postgres
```

**On Windows:**
- Open pgAdmin or use PostgreSQL command prompt
- Ensure PostgreSQL service is running

**In PostgreSQL CLI:**
```sql
-- Verify you can connect
\l                  -- List databases
\q                  -- Quit
```

### Step 3: Create Environment File

```bash
# Copy example to actual .env file
cp .env.example .env

# Edit .env with your database credentials
nano .env    # Linux/Mac
# OR edit with your preferred editor
```

**Update these critical values:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sales_analytics_erp
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_strong_secret_key_here
```

### Step 4: Install Dependencies

```bash
# Install all dependencies (backend, frontend, Python)
npm run setup

# Or install individually:
npm install                              # Root dependencies
cd backend && npm install && cd ..       # Backend
cd frontend && npm install && cd ..      # Frontend
cd analytics-engine && pip install -r requirements.txt && cd ..
```

### Step 5: Initialize Database

```bash
# The database is auto-initialized on server startup
# But you can manually trigger it:
cd backend
node database/init.js

# This will:
# 1. Create the database if it doesn't exist
# 2. Create all tables with proper schema
# 3. Create indexes for performance
# 4. Create triggers for audit logging
# 5. Seed initial test data (roles, demo users)

cd ..
```

**You should see output like:**
```
✅ Database created successfully!
✅ Creating tables...
✅ Creating indexes...
✅ Seeding initial data...
✅ Database initialization complete!
```

### Step 6: Verify Setup

```bash
# Check that PostgreSQL is running
psql -U postgres -d sales_analytics_erp -c "SELECT COUNT(*) FROM users;"

# Should return a count (≥ 0)
```

---

## Running the Project

### Option 1: Run All Services (Recommended)

```bash
# Terminal 1 - Start everything with concurrency
npm run dev

# This starts:
# - Backend (http://localhost:5000)
# - Frontend (http://localhost:3001)
# - Analytics Engine (Python background process)
```

### Option 2: Run Services Separately

**Terminal 1 - Backend Server:**
```bash
npm run start:backend
# or for development with auto-reload:
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# or
cd frontend && npm start
```

**Terminal 3 - Analytics Engine (Optional):**
```bash
npm run start:analytics
# or
cd analytics-engine && python main.py
```

### Option 3: Production Deployment

```bash
# Build frontend for production
cd frontend && npm run build

# Run backend in production
NODE_ENV=production npm start
```

### Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3001 | http://localhost:3001 |
| Backend API | 5000 | http://localhost:5000/api |
| WebSocket | 5000 | ws://localhost:5000 |
| Health Check | 5000 | http://localhost:5000/api/health |

### Test the Application

1. **Open Browser**: Visit http://localhost:3001
2. **Login**: Use test credentials (check database for seeded users)
3. **Navigate**: Explore Dashboard, Sales, Products sections
4. **Create Sale**: Test real-time alerts by creating a new sale
5. **Check API**: Visit http://localhost:5000/api/health

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All endpoints (except `/auth/login` and `/auth/register`) require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "error code"
}
```

### Core Endpoints

#### Authentication
```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # Login and get JWT token
GET    /api/auth/me               # Get current user profile
PUT    /api/auth/me               # Update profile
POST   /api/auth/change-password  # Change password
POST   /api/auth/logout           # Logout
```

#### Users (Admin Only)
```
GET    /api/users                 # List all users
GET    /api/users/:id             # Get user details
POST   /api/users                 # Create new user
PUT    /api/users/:id             # Update user
DELETE /api/users/:id             # Delete user
```

#### Sales (Manager/Admin Can Create)
```
GET    /api/sales                 # List all sales (paginated)
GET    /api/sales/recent          # Get recent sales (last 24h)
GET    /api/sales/today           # Get today's sales
POST   /api/sales                 # Create new sale
GET    /api/sales/:id             # Get sale details
GET    /api/sales/:id/items       # Get sale line items
PUT    /api/sales/:id/status      # Update sale status
```

#### Products (Manager/Admin Can Modify)
```
GET    /api/products              # List all products (paginated)
GET    /api/products/categories   # List categories
GET    /api/products/low-stock    # Get low stock items
GET    /api/products/:id          # Get product details
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
PATCH  /api/products/:id/stock    # Update stock quantity
DELETE /api/products/:id          # Delete product (Admin only)
```

#### Websites
```
GET    /api/websites              # List all websites
GET    /api/websites/:id          # Get website details
POST   /api/websites              # Create website (Admin)
PUT    /api/websites/:id          # Update website (Admin)
```

#### Shops
```
GET    /api/shops                 # List all shops
GET    /api/shops/:id             # Get shop details
POST   /api/shops                 # Create shop (Manager/Admin)
PUT    /api/shops/:id             # Update shop (Manager/Admin)
```

#### Analytics
```
GET    /api/analytics/dashboard         # Dashboard overview
GET    /api/analytics/sales-by-website  # Sales per website
GET    /api/analytics/sales-by-hour     # Hourly breakdown
GET    /api/analytics/top-products      # Top selling products
GET    /api/analytics/peak-hours        # Peak sales times
GET    /api/analytics/revenue-trends    # Revenue over time
```

### Health Check

```bash
curl http://localhost:5000/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "service": "Sales Analytics ERP Backend",
  "author": "Hammad Naeem"
}
```

### WebSocket Events

**Client Events (Listen):**
```javascript
socket.on('new_sale_alert', (data) => {
  // {
  //   sale_id: "uuid",
  //   amount: 5000.00,
  //   product_name: "Product Name",
  //   timestamp: "2026-01-17T10:30:00.000Z"
  // }
});
```

**Client Events (Emit):**
```javascript
socket.emit('join_dashboard');    // Join broadcast room
socket.emit('leave_dashboard');   // Leave room
```

---

## Frontend Features

### Dashboard

The main dashboard provides:
- **Live Sales Counter** - Real-time sales count with WebSocket updates
- **Revenue Cards** - Today's revenue vs. yesterday with percentage change
- **Sales Chart** - Hourly sales visualization using Recharts
- **Peak Hours Chart** - Identifies busiest sales periods
- **Website Comparison** - Revenue breakdown by website
- **Alerts Section** - Low stock and high-priority alerts

### Authentication

- **Login Page** - Email and password authentication
- **Protected Routes** - Routes require valid JWT token
- **Role-Based Access** - Different UI for Admin vs. Manager vs. Viewer
- **Auth Context** - Global auth state using React Context API

### Sales Management

- **Create Sale** - Form to create new sales with:
  - Website selection
  - Product selection (with stock check)
  - Quantity input
  - Auto-calculated totals
- **Sales List** - Paginated, sortable sales history
- **Sale Details** - View detailed sale information and line items

### Product Management

- **Product List** - Browse all products with filtering
- **Stock Status** - Visual indicators for stock levels
- **Low Stock Alerts** - Highlight products below reorder level
- **Categories** - Organize products by category

### Admin Features

- **User Management** - Create, edit, delete users
- **Role Assignment** - Assign permissions to users
- **Inventory Control** - Advanced inventory management
- **Sales Control** - Modify sales and statuses

### Real-Time Updates

WebSocket integration provides:
- Instant sale notifications (toast alerts)
- Automatic dashboard refresh on new sales
- Live customer count updates
- Stock level changes broadcast

---

## Python Analytics Engine

### Purpose

The Python Analytics Engine runs as a background service and:
1. Generates fake sales data at regular intervals (for testing/demo)
2. Calculates aggregated statistics (hourly, daily)
3. Manages low-stock alerts and replenishment
4. Runs scheduled jobs without blocking the API server

### Key Features

**Sales Generation:**
- Creates realistic fake transactions using Faker library
- Distributes sales across multiple websites and shops
- Randomizes products, customers, and amounts
- Inserts data every 60 seconds (configurable)

**Analytics Aggregations:**
- Hourly stats: Sales count, revenue, average order value
- Daily stats: Complete daily metrics with top products
- Automatically fills gaps and updates existing records

**Stock Management:**
- Monitors products below reorder level
- Sends notifications to dashboard
- Suggests replenishment quantities

### Running

```bash
# Start the analytics engine
npm run start:analytics

# Or directly:
cd analytics-engine && python main.py

# It will run indefinitely until CTRL+C
```

### Output

```
2026-01-17 10:30:15 - __main__ - INFO - ==================================================
2026-01-17 10:30:15 - __main__ - INFO - Running sales generation - 2026-01-17 10:30:15.123456
2026-01-17 10:30:20 - __main__ - INFO - Today's Total: 42 sales, Rs. 125,400.00
2026-01-17 10:30:20 - __main__ - INFO - ==================================================
```

### Configuration

In `.env`:
```env
ENABLE_SIMULATION=true              # Enable/disable
SIMULATION_INTERVAL_SECONDS=60      # Run every X seconds
```

---

## Common Issues & Fixes

### 1. Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Fix:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql    # Linux
pg_isready                          # Any OS

# Start PostgreSQL if not running
sudo systemctl start postgresql     # Linux
brew services start postgresql     # macOS

# Verify credentials in .env match your PostgreSQL setup
psql -U postgres -h localhost -d sales_analytics_erp
```

### 2. Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000` or `:::3001`

**Fix:**
```bash
# Find and kill process using port
lsof -i :5000                       # List process on port 5000
kill -9 <PID>                       # Kill the process

# Or change port in .env
PORT=5001                           # Use different port
```

### 3. JWT Authentication Failed

**Error:** `401 Unauthorized - Invalid token`

**Fix:**
```bash
# Verify token is sent correctly in header
Authorization: Bearer <token>

# Check JWT_SECRET in .env matches backend
# Tokens expire after JWT_EXPIRES_IN (default 24h)

# Get new token by logging in again
POST /api/auth/login
```

### 4. CORS Error (Frontend to Backend)

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**
```bash
# Check backend CORS configuration in server.js
# Ensure frontend URL is in the allowed origins:
# http://localhost:3001
# http://127.0.0.1:3001

# If using different URL/port, update in server.js CORS config
```

### 5. Database Already Exists

**Error:** `Database with name sales_analytics_erp already exists`

**Fix:**
```bash
# Option 1: Delete and recreate
dropdb -U postgres sales_analytics_erp
psql -U postgres -f backend/database/init.js

# Option 2: Use existing database
# Just run the server - it will use existing tables

# Option 3: Full reset
psql -U postgres
DROP DATABASE IF EXISTS sales_analytics_erp;
DROP USER IF EXISTS sales_user;
```

### 6. React Build Fails

**Error:** `npm ERR! code ELIFECYCLE`

**Fix:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### 7. Python Dependencies Error

**Error:** `ModuleNotFoundError: No module named 'psycopg2'`

**Fix:**
```bash
cd analytics-engine
pip install -r requirements.txt

# If still fails, install individually:
pip install psycopg2-binary==2.9.9
pip install python-dotenv==1.0.0
pip install faker==21.0.0
```

### 8. WebSocket Connection Failed

**Error:** Socket.io failing to connect in console

**Fix:**
```bash
# Ensure backend is running with Socket.io configured
npm run start:backend

# Check REACT_APP_API_URL matches backend URL
# In frontend .env:
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Future Improvements

### Planned Features

**Short-term (v1.1):**
- [ ] Email notifications for low stock and high-value sales
- [ ] Advanced filtering and search on all list views
- [ ] Export data to CSV/PDF reports
- [ ] Customer loyalty program integration
- [ ] Multi-currency support

**Medium-term (v1.2):**
- [ ] Mobile app (React Native)
- [ ] Advanced predictive analytics (ML-based forecasting)
- [ ] Supplier management module
- [ ] Purchase order automation
- [ ] Warehouse management system integration
- [ ] SMS alerts for critical events

**Long-term (v2.0):**
- [ ] ERP modules (HR, Accounting, Procurement)
- [ ] International expansion (multi-language, multi-region)
- [ ] Machine learning recommendations
- [ ] Advanced security (SSO, 2FA, encryption)
- [ ] Mobile payment integration
- [ ] Blockchain-based audit trails
- [ ] IoT integration for inventory tracking
- [ ] Real-time competitor analysis

### Technical Improvements

- [ ] GraphQL API as alternative to REST
- [ ] Redis caching for improved performance
- [ ] Elasticsearch for advanced search
- [ ] Message queue (RabbitMQ) for async operations
- [ ] Microservices architecture
- [ ] Kubernetes deployment manifests
- [ ] Enhanced test coverage (unit, integration, E2E)
- [ ] API rate limiting and throttling
- [ ] Advanced monitoring and alerting
- [ ] CDN integration for static assets

---

## Security & Best Practices

### Authentication & Authorization

✅ **JWT Tokens** - Stateless token-based authentication  
✅ **Password Hashing** - bcryptjs with 12 salt rounds  
✅ **Role-Based Access Control** - Three-tier permission system (Admin, Manager, Viewer)  
✅ **Protected Routes** - All sensitive endpoints require valid token  
✅ **Token Expiration** - Configurable expiration (default 24 hours)  

### Database Security

✅ **Prepared Statements** - Prevent SQL injection via parameterized queries  
✅ **Environment Variables** - Database credentials never in source code  
✅ **Foreign Keys** - Referential integrity constraints  
✅ **Audit Logging** - All changes tracked with user information  
✅ **Connection Pooling** - Efficient resource management  

### API Security

✅ **CORS Configuration** - Restricted to trusted origins  
✅ **Helmet Middleware** - Sets secure HTTP headers  
✅ **Input Validation** - All inputs validated with express-validator  
✅ **Error Handling** - Generic error messages, no stack traces exposed  
✅ **Morgan Logging** - Request logging for security analysis  

### Code Security

✅ **Dependencies Tracked** - Using package-lock.json for reproducible builds  
✅ **.gitignore** - Secrets and sensitive files excluded  
✅ **Environment Files** - .env not committed to repository  
✅ **No Hardcoded Secrets** - All configuration externalized  

### Production Checklist

Before deploying to production:

- [ ] Update JWT_SECRET to a strong, unique value (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure database with strong password
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure backup strategy for database
- [ ] Enable database connection encryption
- [ ] Implement rate limiting on API
- [ ] Set up monitoring and alerting
- [ ] Enable request logging and audit trails
- [ ] Configure CORS with specific domain
- [ ] Test all authentication flows
- [ ] Run security audit on dependencies
- [ ] Set up automated backups
- [ ] Document deployment procedures
- [ ] Create incident response plan

---

## Contribution Guidelines

### How to Contribute

1. **Fork Repository**
   ```bash
   git clone https://github.com/yourusername/sales-analytics-er-11.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add comments for complex logic
   - Ensure no console errors/warnings

4. **Test Thoroughly**
   - Test on all browsers
   - Verify database interactions
   - Check API endpoints with Postman/curl
   - Test with various user roles

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Wait for review

### Code Style Guidelines

**JavaScript/Node.js:**
- Use const/let (not var)
- Use async/await (not callbacks)
- Add JSDoc comments on functions
- Keep functions small and focused
- Use meaningful variable names

**React:**
- Use functional components with hooks
- Keep components small and reusable
- Use proper prop types or TypeScript
- Organize in logical folders

**Python:**
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions
- Keep functions DRY

**SQL:**
- Use UPPERCASE for keywords
- Use descriptive table/column names
- Add comments for complex queries
- Always use parameterized queries

### Reporting Issues

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/logs
- Environment details (OS, browser, Node version)

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

### MIT License Summary

You are free to:
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute the software
- ✅ Use privately

You must:
- 📋 Include the original license
- 📋 State significant changes

You cannot:
- ❌ Hold liable the original author
- ❌ Use trademark without permission

---

## Author

### Made by Hammad Naeem

**Hammad Naeem** is a full-stack software engineer specializing in building scalable, enterprise-grade applications with modern tech stacks.

- **GitHub**: [@hammadnaeem](https://github.com/hammadnaeem)
- **Email**: hammad.naeem@example.com
- **Portfolio**: [Your portfolio URL]

---

## Project Statistics

- **Total Lines of Code**: ~5,000+
- **Database Tables**: 13
- **API Endpoints**: 40+
- **React Components**: 20+
- **Python Modules**: 8+

---

## Acknowledgments

- PostgreSQL for robust relational database
- React team for excellent frontend framework
- Express.js community for robust backend framework
- Socket.io for real-time communication capabilities
- All open-source contributors whose libraries made this possible

---

## Getting Help

### Documentation
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database ER Diagram](docs/ER_DIAGRAM.md)
- [Project Documentation](docs/PROJECT_DOCUMENTATION.md)
- [Real-Time Alerts Guide](REALTIME_ALERTS_GUIDE.md)

### Support
- Check [Common Issues & Fixes](#common-issues--fixes) section
- Review error logs in `logs/` directory
- Check backend console output for detailed errors

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0  
**Status**: Production Ready

---

*This README is maintained with ❤️ by the development team.*
>>>>>>> d7b9911 (Initial commit: Sales Analytics ERP System)
