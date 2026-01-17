/**
 * ============================================
 * Main Dashboard Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import Toast from '../common/Toast';
import Loading from '../common/Loading';
import LiveSalesCounter from './LiveSalesCounter';
import SalesChart from './SalesChart';
import RevenueCard from './RevenueCard';
import WebsiteComparison from './WebsiteComparison';
import PeakHoursChart from './PeakHoursChart';
import { 
    ShoppingCart, 
    DollarSign, 
    TrendingUp, 
    Users, 
    Package,
    AlertTriangle 
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toasts, setToasts] = useState([]);
    const { newSaleAlert } = useSocket();

    useEffect(() => {
        fetchDashboardData();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Listen for new sale alerts
    useEffect(() => {
        if (newSaleAlert) {
            // Add toast notification
            const toastId = Date.now();
            const message = `🎉 New Sale! Rs. ${formatCurrency(newSaleAlert.amount, false)} received just now`;
            
            setToasts(prev => [...prev, {
                id: toastId,
                message,
                type: 'success'
            }]);

            // Update dashboard data automatically
            fetchDashboardData();

            // Auto-remove toast after 5 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 5000);
        }
    }, [newSaleAlert]);

    const fetchDashboardData = async () => {
        try {
            const response = await analyticsAPI.getDashboard();
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeToast = (toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
    };

    if (loading) {
        return <Loading message="Loading dashboard..." />;
    }

    if (error) {
        return (
            <div className="empty-state">
                <AlertTriangle className="empty-state-icon" />
                <h3 className="empty-state-title">Error Loading Dashboard</h3>
                <p className="empty-state-text">{error}</p>
                <button className="btn btn-primary" onClick={fetchDashboardData}>
                    Retry
                </button>
            </div>
        );
    }

    const { today, comparison, month, counts } = dashboardData || {};

    return (
        <div className="dashboard">
            {/* Toast Notifications */}
            <div className="toasts-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {/* Live Sales Counter */}
            <LiveSalesCounter />
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Today's Sales</div>
                        <div className="stat-value">{formatNumber(today?.totalSales || 0)}</div>
                        <div className={`stat-change ${comparison?.salesChange >= 0 ? 'positive' : 'negative'}`}>
                            {comparison?.salesChange >= 0 ? '↑' : '↓'} {Math.abs(comparison?.salesChange || 0)}% vs yesterday
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon green">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Today's Revenue</div>
                        <div className="stat-value">{formatCurrency(today?.totalRevenue || 0)}</div>
                        <div className={`stat-change ${comparison?.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                            {comparison?.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(comparison?.revenueChange || 0)}% vs yesterday
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon yellow">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Avg Order Value</div>
                        <div className="stat-value">{formatCurrency(today?.avgOrderValue || 0)}</div>
                        <div className="stat-change positive">Today's average</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Unique Customers</div>
                        <div className="stat-value">{formatNumber(today?.uniqueCustomers || 0)}</div>
                        <div className="stat-change positive">Today</div>
                    </div>
                </div>
            </div>
            
            {/* Secondary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Monthly Sales</div>
                        <div className="stat-value">{formatNumber(month?.totalSales || 0)}</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon green">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Monthly Revenue</div>
                        <div className="stat-value">{formatCurrency(month?.totalRevenue || 0)}</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Active Products</div>
                        <div className="stat-value">{formatNumber(counts?.products || 0)}</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon red">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Low Stock Items</div>
                        <div className="stat-value">{formatNumber(counts?.lowStock || 0)}</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <SalesChart />
                <WebsiteComparison />
            </div>
            
            {/* Second Charts Row */}
            <div className="charts-grid">
                <PeakHoursChart />
                <RevenueCard />
            </div>
        </div>
    );
}

export default Dashboard;