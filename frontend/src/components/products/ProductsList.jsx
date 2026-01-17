/**
 * ============================================
 * Products List Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import Loading from '../common/Loading';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Package, Search, AlertTriangle, RefreshCw } from 'lucide-react';

function ProductsList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ search: '', category: '' });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [pagination.page, filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll({
                page: pagination.page,
                limit: 20,
                search: filters.search || undefined,
                category: filters.category || undefined
            });
            
            if (response.data.success) {
                setProducts(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination?.totalPages || 1
                }));
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await productsAPI.getCategories();
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchProducts();
    };

    const isLowStock = (product) => {
        return product.stock_quantity < product.reorder_level;
    };

    if (loading && products.length === 0) {
        return <Loading message="Loading products..." />;
    }

    return (
        <div className="products-list">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <Package size={20} style={{ marginRight: '8px' }} />
                        Products Inventory
                    </h2>
                    <button className="btn btn-secondary btn-sm" onClick={fetchProducts}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
                
                <div className="card-body">
                    {/* Filters */}
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                        
                        <select 
                            className="form-select" 
                            style={{ width: '200px' }}
                            value={filters.category}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, category: e.target.value }));
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </form>
                    
                    {/* Products Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Unit Price</th>
                                    <th>Stock</th>
                                    <th>Total Sold</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {product.sku}
                                                </code>
                                            </td>
                                            <td>
                                                <strong>{product.name}</strong>
                                            </td>
                                            <td>{product.category_name || '-'}</td>
                                            <td>{formatCurrency(product.unit_price)}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {formatNumber(product.stock_quantity)}
                                                    {isLowStock(product) && (
                                                        <AlertTriangle size={16} color="#f59e0b" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>{formatNumber(product.total_sold || 0)}</td>
                                            <td>
                                                {isLowStock(product) ? (
                                                    <span className="badge badge-warning">Low Stock</span>
                                                ) : product.is_active ? (
                                                    <span className="badge badge-success">In Stock</span>
                                                ) : (
                                                    <span className="badge badge-danger">Inactive</span>
                                                )}
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
                            
                            <span style={{ padding: '8px 16px' }}>
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            
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
        </div>
    );
}

export default ProductsList;