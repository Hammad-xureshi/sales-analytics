/**
 * ============================================
 * Sales List Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { salesAPI } from '../../services/api';
import Loading from '../common/Loading';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ShoppingCart, Eye, Filter, RefreshCw, Plus } from 'lucide-react';
import CreateSale from './CreateSale';

function SalesList() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
    const [filters, setFilters] = useState({});
    const [selectedSale, setSelectedSale] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showCreateSaleModal, setShowCreateSaleModal] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [pagination.page, filters]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await salesAPI.getAll({
                page: pagination.page,
                limit: 20,
                ...filters
            });
            
            if (response.data.success) {
                setSales(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination.totalPages,
                    totalCount: response.data.pagination.totalCount
                }));
            }
        } catch (err) {
            console.error('Failed to fetch sales:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (saleId) => {
        try {
            const response = await salesAPI.getById(saleId);
            if (response.data.success) {
                setSelectedSale(response.data.data);
                setShowDetails(true);
            }
        } catch (err) {
            console.error('Failed to fetch sale details:', err);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'cancelled': return 'badge-danger';
            default: return 'badge-gray';
        }
    };

    if (loading && sales.length === 0) {
        return <Loading message="Loading sales..." />;
    }

    return (
        <div className="sales-list">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <ShoppingCart size={20} style={{ marginRight: '8px' }} />
                        Sales Orders
                    </h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => setShowCreateSaleModal(true)}
                        >
                            <Plus size={16} />
                            Create Sale
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={fetchSales}>
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>
                
                <div className="card-body">
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <select 
                            className="form-select" 
                            style={{ width: '200px' }}
                            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value || undefined }))}
                        >
                            <option value="">All Payment Methods</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="online">Online</option>
                        </select>
                        
                        <input
                            type="date"
                            className="form-input"
                            style={{ width: '180px' }}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                            placeholder="Start Date"
                        />
                        
                        <input
                            type="date"
                            className="form-input"
                            style={{ width: '180px' }}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                            placeholder="End Date"
                        />
                    </div>
                    
                    {/* Sales Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date & Time</th>
                                    <th>Website</th>
                                    <th>Shop</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                            No sales found
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.id}>
                                            <td>
                                                <strong>{sale.sale_number}</strong>
                                            </td>
                                            <td>{formatDate(sale.sale_date, 'datetime')}</td>
                                            <td>{sale.website_name || '-'}</td>
                                            <td>{sale.shop_name || '-'}</td>
                                            <td>{sale.item_count || 0}</td>
                                            <td>
                                                <strong>{formatCurrency(sale.total_amount)}</strong>
                                            </td>
                                            <td>
                                                <span className="badge badge-gray">
                                                    {sale.payment_method}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(sale.payment_status)}`}>
                                                    {sale.payment_status}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleViewDetails(sale.id)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                className="pagination-btn"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                Previous
                            </button>
                            
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button 
                                className="pagination-btn"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Sale Details Modal */}
            {showDetails && selectedSale && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order Details: {selectedSale.sale_number}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowDetails(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <strong>Website:</strong> {selectedSale.website_name || '-'}
                                </div>
                                <div>
                                    <strong>Shop:</strong> {selectedSale.shop_name || '-'}
                                </div>
                                <div>
                                    <strong>Date:</strong> {formatDate(selectedSale.sale_date, 'datetime')}
                                </div>
                                <div>
                                    <strong>Payment:</strong> {selectedSale.payment_method}
                                </div>
                            </div>
                            
                            <h4 style={{ marginBottom: '12px' }}>Items</h4>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSale.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unit_price)}</td>
                                            <td>{formatCurrency(item.line_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <div>Subtotal: {formatCurrency(selectedSale.subtotal)}</div>
                                <div>Tax: {formatCurrency(selectedSale.tax_amount)}</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>
                                    Total: {formatCurrency(selectedSale.total_amount)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                }
                .modal-body {
                    padding: 20px;
                }
            `}</style>

            {/* Create Sale Modal */}
            {showCreateSaleModal && (
                <CreateSale
                    onClose={() => setShowCreateSaleModal(false)}
                    onSuccess={() => {
                        setShowCreateSaleModal(false);
                        fetchSales();
                    }}
                />
            )}
        </div>
    );
}

export default SalesList;