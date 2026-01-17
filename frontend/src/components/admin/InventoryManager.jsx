/**
 * ============================================
 * Inventory Manager Component
 * Stock management with account balance tracking
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { Plus, Minus, RefreshCw, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { productsAPI } from '../../services/api';
import Toast from '../common/Toast';
import api from '../../services/api';

function InventoryManager({ onRefresh }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toasts, setToasts] = useState([]);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [accountBalance, setAccountBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch products
            const productsRes = await productsAPI.getAll({ limit: 100 });
            if (productsRes.data.success) {
                setProducts(productsRes.data.data);
            }

            // Fetch account balance
            try {
                const balanceRes = await api.get('/account/balance');
                if (balanceRes.data.success) {
                    setAccountBalance(balanceRes.data.data.accountBalance);
                }
            } catch (error) {
                console.log('Account balance API not yet available');
            }

            // Fetch transaction history
            try {
                const transRes = await api.get('/account/transaction-history?limit=5');
                if (transRes.data.success) {
                    setTransactions(transRes.data.data);
                }
            } catch (error) {
                console.log('Transaction history API not yet available');
            }
        } catch (error) {
            addToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (productId, quantity, operation) => {
        try {
            const response = await productsAPI.updateStock(productId, quantity, operation);
            if (response.data.success) {
                addToast(response.data.data.message || `Stock updated successfully`, 'success');
                
                // If it was an add operation, show balance update
                if (operation === 'add' && response.data.data.accountUpdate) {
                    const balanceUpdate = response.data.data.accountUpdate;
                    addToast(
                        `💰 Rs. ${balanceUpdate.amountDeducted.toLocaleString()} deducted. New Balance: Rs. ${balanceUpdate.newBalance.toLocaleString()}`,
                        'info'
                    );
                    setAccountBalance(balanceUpdate.newBalance);
                }
                
                fetchData();
                setQuantities(prev => ({ ...prev, [productId]: '' }));
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update stock', 'error');
        }
    };

    const addToast = (message, type) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockProducts = filteredProducts.filter(p => p.stock_quantity < p.reorder_level);
    const outOfStockProducts = filteredProducts.filter(p => p.stock_quantity === 0);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
    }

    return (
        <div className="inventory-manager">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                />
            ))}

            {/* Account Balance Card */}
            <div className="account-balance-card">
                <div className="balance-icon">
                    <Wallet size={32} />
                </div>
                <div className="balance-content">
                    <p className="balance-label">Account Balance</p>
                    <p className="balance-value">Rs. {formatCurrency(accountBalance)}</p>
                    <p className="balance-note">Available for stock purchases</p>
                </div>
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
                <div className="transaction-history">
                    <h3>Recent Transactions</h3>
                    <div className="transaction-list">
                        {transactions.slice(0, 3).map((trans, idx) => (
                            <div key={idx} className="transaction-item">
                                <div className="transaction-info">
                                    <p className="transaction-type">{trans.transaction_type}</p>
                                    <p className="transaction-desc">{trans.description}</p>
                                </div>
                                <div className="transaction-amount">
                                    <span className={trans.transaction_type === 'stock_purchase' ? 'debit' : 'credit'}>
                                        {trans.transaction_type === 'stock_purchase' ? '-' : '+'}Rs. {formatCurrency(Math.abs(trans.amount))}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alerts Section */}
            <div className="alerts-section">
                {outOfStockProducts.length > 0 && (
                    <div className="alert critical">
                        <AlertTriangle size={20} />
                        <div>
                            <h4>Out of Stock</h4>
                            <p>{outOfStockProducts.length} products need immediate attention</p>
                        </div>
                    </div>
                )}

                {lowStockProducts.length > 0 && lowStockProducts.length === filteredProducts.filter(p => p.stock_quantity === 0).length === 0 && (
                    <div className="alert warning">
                        <AlertTriangle size={20} />
                        <div>
                            <h4>Low Stock Warning</h4>
                            <p>{lowStockProducts.length} products below reorder level</p>
                        </div>
                    </div>
                )}

                {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
                    <div className="alert success">
                        <CheckCircle size={20} />
                        <div>
                            <h4>All Products Stocked</h4>
                            <p>All products have healthy stock levels</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => fetchData()}>
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Products Table */}
            <div className="products-table">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Current Stock</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <React.Fragment key={product.id}>
                                <tr className={product.stock_quantity === 0 ? 'out-of-stock' : product.stock_quantity < product.reorder_level ? 'low-stock' : ''}>
                                    <td>
                                        <button
                                            className="expand-btn"
                                            onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                                        >
                                            {product.name}
                                        </button>
                                    </td>
                                    <td>{product.sku}</td>
                                    <td className="stock-qty">{product.stock_quantity} units</td>
                                    <td>{product.reorder_level} units</td>
                                    <td>
                                        {product.stock_quantity === 0 ? (
                                            <span className="status out-of-stock">Out of Stock</span>
                                        ) : product.stock_quantity < product.reorder_level ? (
                                            <span className="status low-stock">Low Stock</span>
                                        ) : (
                                            <span className="status in-stock">In Stock</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="quick-actions">
                                            <button
                                                className="quick-btn add"
                                                onClick={() => handleStockUpdate(product.id, 1, 'add')}
                                                title="Add 1 unit"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                className="quick-btn remove"
                                                onClick={() => handleStockUpdate(product.id, 1, 'subtract')}
                                                title="Remove 1 unit"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {expandedProduct === product.id && (
                                    <tr className="expanded-row">
                                        <td colSpan="6">
                                            <div className="expansion-panel">
                                                <div className="panel-section">
                                                    <label>Quantity to Add</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={quantities[product.id] || ''}
                                                            onChange={(e) => setQuantities(prev => ({ ...prev, [product.id]: e.target.value }))}
                                                            placeholder="Enter quantity"
                                                        />
                                                        <button
                                                            className="action-btn add"
                                                            onClick={() => quantities[product.id] && handleStockUpdate(product.id, parseInt(quantities[product.id]), 'add')}
                                                        >
                                                            Add Stock
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="panel-section">
                                                    <label>Quantity to Remove</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={product.stock_quantity}
                                                            placeholder="Enter quantity"
                                                            onChange={(e) => setQuantities(prev => ({ ...prev, [product.id + '_remove']: e.target.value }))}
                                                        />
                                                        <button
                                                            className="action-btn remove"
                                                            onClick={() => quantities[product.id + '_remove'] && handleStockUpdate(product.id, parseInt(quantities[product.id + '_remove']), 'subtract')}
                                                        >
                                                            Remove Stock
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="panel-section">
                                                    <label>Set to Exact Quantity</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Enter exact quantity"
                                                            onChange={(e) => setQuantities(prev => ({ ...prev, [product.id + '_set']: e.target.value }))}
                                                        />
                                                        <button
                                                            className="action-btn set"
                                                            onClick={() => quantities[product.id + '_set'] && handleStockUpdate(product.id, parseInt(quantities[product.id + '_set']), 'set')}
                                                        >
                                                            Set Stock
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="panel-info">
                                                    <p><strong>Price:</strong> Rs. {product.price.toLocaleString()}</p>
                                                    <p><strong>Cost:</strong> Rs. {product.cost.toLocaleString()}</p>
                                                    <p><strong>Margin:</strong> {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .inventory-manager {
                    padding: 20px;
                    background: #f9fafb;
                    min-height: 100vh;
                }

                .account-balance-card {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .balance-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                }

                .balance-content {
                    flex: 1;
                }

                .balance-label {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.9;
                }

                .balance-value {
                    margin: 4px 0;
                    font-size: 32px;
                    font-weight: 700;
                }

                .balance-note {
                    margin: 4px 0 0 0;
                    font-size: 12px;
                    opacity: 0.8;
                }

                .transaction-history {
                    margin-bottom: 20px;
                    padding: 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                }

                .transaction-history h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: #1e293b;
                }

                .transaction-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 6px;
                    border-left: 3px solid #3b82f6;
                }

                .transaction-info {
                    flex: 1;
                }

                .transaction-type {
                    margin: 0 0 4px 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: #1e293b;
                    text-transform: uppercase;
                }

                .transaction-desc {
                    margin: 0;
                    font-size: 12px;
                    color: #64748b;
                }

                .transaction-amount {
                    font-weight: 700;
                    font-size: 14px;
                }

                .transaction-amount .debit {
                    color: #dc2626;
                }

                .transaction-amount .credit {
                    color: #10b981;
                }

                .alerts-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid;
                }

                .alert.critical {
                    background: #fee2e2;
                    border-left-color: #dc2626;
                    color: #7f1d1d;
                }

                .alert.warning {
                    background: #fef3c7;
                    border-left-color: #f59e0b;
                    color: #78350f;
                }

                .alert.success {
                    background: #dcfce7;
                    border-left-color: #16a34a;
                    color: #15803d;
                }

                .alert h4 {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    font-weight: 600;
                }

                .alert p {
                    margin: 0;
                    font-size: 13px;
                }

                .search-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .search-bar input {
                    flex: 1;
                    padding: 10px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .search-bar button {
                    padding: 10px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                }

                .search-bar button:hover {
                    background: #2563eb;
                }

                .products-table {
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    background: #f3f4f6;
                    border-bottom: 1px solid #e5e7eb;
                }

                th {
                    padding: 12px 16px;
                    text-align: left;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                tr:hover {
                    background: #f9fafb;
                }

                tr.out-of-stock {
                    background: #fef2f2;
                }

                tr.low-stock {
                    background: #fffbeb;
                }

                td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 14px;
                }

                .expand-btn {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    cursor: pointer;
                    text-align: left;
                    font-weight: 500;
                }

                .expand-btn:hover {
                    text-decoration: underline;
                }

                .stock-qty {
                    font-weight: 600;
                    color: #1e293b;
                }

                .status {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .status.in-stock {
                    background: #dcfce7;
                    color: #15803d;
                }

                .status.low-stock {
                    background: #fef3c7;
                    color: #78350f;
                }

                .status.out-of-stock {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .quick-actions {
                    display: flex;
                    gap: 8px;
                }

                .quick-btn {
                    padding: 6px 12px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quick-btn.add {
                    color: #16a34a;
                    border-color: #16a34a;
                }

                .quick-btn.add:hover {
                    background: #dcfce7;
                }

                .quick-btn.remove {
                    color: #dc2626;
                    border-color: #dc2626;
                }

                .quick-btn.remove:hover {
                    background: #fee2e2;
                }

                .expanded-row {
                    background: #f9fafb;
                }

                .expanded-row td {
                    padding: 0;
                    border: none;
                }

                .expansion-panel {
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .panel-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .panel-section label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 13px;
                }

                .input-group {
                    display: flex;
                    gap: 8px;
                }

                .input-group input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .action-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 13px;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .action-btn.add {
                    background: #dcfce7;
                    color: #15803d;
                }

                .action-btn.add:hover {
                    background: #bbf7d0;
                }

                .action-btn.remove {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .action-btn.remove:hover {
                    background: #fecaca;
                }

                .action-btn.set {
                    background: #dbeafe;
                    color: #0c4a6e;
                }

                .action-btn.set:hover {
                    background: #bfdbfe;
                }

                .panel-info {
                    grid-column: 1 / -1;
                    display: flex;
                    gap: 20px;
                    padding: 12px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                }

                .panel-info p {
                    margin: 0;
                    font-size: 13px;
                    color: #374151;
                }

                .panel-info strong {
                    color: #1e293b;
                }
            `}</style>
        </div>
    );
}

export default InventoryManager;
