/**
 * ============================================
 * Admin Dashboard with Full Controls
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, Settings, BarChart3, Lock } from 'lucide-react';
import InventoryManager from './InventoryManager';
import SalesControl from './SalesControl';
import LowStockAlert from './LowStockAlert';
import { productsAPI, analyticsAPI } from '../../services/api';
import Loading from '../common/Loading';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            
            // Fetch dashboard stats
            const statsRes = await analyticsAPI.getDashboard();
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            // Fetch low stock products
            const lowStockRes = await productsAPI.getLowStock();
            if (lowStockRes.data.success) {
                setLowStockProducts(lowStockRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Loading Admin Dashboard..." />;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="header-content">
                    <div className="header-title">
                        <Lock size={32} />
                        <div>
                            <h1>Admin Control Panel</h1>
                            <p>Manage inventory, sales, and system settings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <LowStockAlert products={lowStockProducts} />
            )}

            {/* Admin Stats */}
            <div className="admin-stats">
                <div className="stat-box">
                    <Package size={24} />
                    <div>
                        <p className="stat-label">Low Stock Items</p>
                        <p className="stat-value">{lowStockProducts.length}</p>
                    </div>
                </div>
                <div className="stat-box">
                    <AlertTriangle size={24} />
                    <div>
                        <p className="stat-label">Critical Stock</p>
                        <p className="stat-value">
                            {lowStockProducts.filter(p => p.stock_quantity === 0).length}
                        </p>
                    </div>
                </div>
                <div className="stat-box">
                    <BarChart3 size={24} />
                    <div>
                        <p className="stat-label">Total Products</p>
                        <p className="stat-value">
                            {stats?.counts?.products || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Package size={18} />
                    Inventory Manager
                </button>
                <button
                    className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    <BarChart3 size={18} />
                    Sales Control
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={18} />
                    System Settings
                </button>
            </div>

            {/* Tab Content */}
            <div className="admin-content">
                {activeTab === 'inventory' && <InventoryManager onRefresh={fetchAdminData} />}
                {activeTab === 'sales' && <SalesControl />}
                {activeTab === 'settings' && <SystemSettings />}
            </div>

            <style jsx>{`
                .admin-dashboard {
                    padding: 20px;
                }

                .admin-header {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .header-title h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .header-title p {
                    margin: 4px 0 0 0;
                    opacity: 0.9;
                }

                .admin-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 30px;
                }

                .stat-box {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    border: 2px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s ease;
                }

                .stat-box:hover {
                    border-color: #ef4444;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
                }

                .stat-box svg {
                    color: #ef4444;
                    flex-shrink: 0;
                }

                .stat-label {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 4px 0 0 0;
                }

                .admin-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e5e7eb;
                    overflow-x: auto;
                }

                .tab-btn {
                    padding: 12px 20px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .tab-btn:hover {
                    color: #1e293b;
                }

                .tab-btn.active {
                    color: #ef4444;
                    border-bottom-color: #ef4444;
                }

                .admin-content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                }

                @media (max-width: 768px) {
                    .admin-header {
                        padding: 20px;
                    }

                    .header-title {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .admin-stats {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

function SystemSettings() {
    return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
            <Settings size={48} color="#64748b" style={{ marginBottom: '16px' }} />
            <h3>System Settings</h3>
            <p>Coming Soon...</p>
        </div>
    );
}

export default AdminDashboard;