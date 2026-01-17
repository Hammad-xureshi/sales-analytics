# Real-Time Sales Alerts - Quick Guide

## 🎯 How to Test Real-Time Alerts

### Step 1: Start All Services
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start

# Terminal 3 - Analytics (optional)
cd analytics-engine && python main.py
```

### Step 2: Open Two Browser Windows
1. **Window 1**: Dashboard (http://localhost:3000)
2. **Window 2**: Sales Management (http://localhost:3000/sales)

### Step 3: Create a Sale
1. Go to **Sales** page (Window 2)
2. Click **"Create Sale"** button
3. Select a **Website**
4. Select **Products** and enter **Quantity**
5. Click **"Create Sale"**

### Step 4: See Real-Time Alert
✅ The **Dashboard** in Window 1 will immediately show:
- 🔔 Toast notification: "🎉 New Sale! Rs. XXXX.XX received just now"
- 📊 Dashboard stats update automatically
- 💹 Total sales count increases in real-time

---

## 📱 What Happens Behind the Scenes

### Frontend
1. User creates a sale via the **Create Sale** form
2. Sale is sent to backend API: `POST /api/sales`
3. Frontend awaits response with sale confirmation

### Backend
1. Sale is inserted into database with transaction
2. **Socket.io emits event**: `new_sale_alert`
3. Event includes: sale ID, amount, product name, timestamp

### Socket.io Connection
1. All connected dashboard clients listen for `new_sale_alert`
2. Event received instantly via WebSocket
3. Toast notification displayed
4. Dashboard stats refreshed automatically

---

## 🔧 File Structure

```
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

```

---

## 🔌 Socket.io Events

### Frontend Emits
```javascript
socket.emit('join_dashboard')   // Join dashboard room
socket.emit('leave_dashboard')  // Leave dashboard room
```

### Backend Emits
```javascript
io.to('dashboard').emit('new_sale_alert', saleData)
io.to('dashboard').emit('stats_update', statsData)
```

---

## ✨ Features Included

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

---

## 🐛 Troubleshooting

### Toast notification not appearing?
- Check browser console for Socket.io connection errors
- Verify backend server is running
- Check Network tab in DevTools for WebSocket

### Dashboard not updating?
- Verify Socket.io connection: `io.isConnected()`
- Check Console for `new_sale_alert` events
- Ensure SocketProvider wraps App component

### Sale not creating?
- Verify website and products are available in database
- Check backend logs for database errors
- Ensure JWT token is valid

---

## 📊 Demo Credentials
- **Email**: admin@saleserp.com
- **Password**: admin123

---

Made by Hammad Naeem - 2026
