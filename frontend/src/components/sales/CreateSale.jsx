/**
 * ============================================
 * Create Sale Form Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { salesAPI, websitesAPI, productsAPI } from '../../services/api';
import { X, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

function CreateSale({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        websiteId: '',
        shopId: '',
        customerId: '',
        items: [{ productId: '', quantity: 1 }],
        paymentMethod: 'cash',
        notes: ''
    });

    const [websites, setWebsites] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });

    useEffect(() => {
        fetchWebsites();
        fetchProducts();
    }, []);

    useEffect(() => {
        calculateTotals();
    }, [formData.items]);

    const fetchWebsites = async () => {
        try {
            const response = await websitesAPI.getAll();
            if (response.data.success) {
                setWebsites(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch websites:', err);
            setError('Failed to load websites');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products');
        }
    };

    const calculateTotals = () => {
        let subtotal = 0;

        formData.items.forEach(item => {
            if (item.productId && item.quantity) {
                const product = products.find(p => p.id === parseInt(item.productId));
                if (product) {
                    subtotal += product.unit_price * item.quantity;
                }
            }
        });

        const tax = subtotal * 0.17; // 17% GST
        const total = subtotal + tax;

        setTotals({ subtotal, tax, total });
    };

    const handleWebsiteChange = (e) => {
        setFormData(prev => ({
            ...prev,
            websiteId: parseInt(e.target.value) || ''
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = field === 'quantity' ? parseInt(value) || 0 : parseInt(value) || '';
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.websiteId) {
            setError('Please select a website');
            return;
        }

        if (formData.items.length === 0 || formData.items[0].productId === '') {
            setError('Please add at least one product');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                websiteId: formData.websiteId,
                shopId: formData.shopId ? parseInt(formData.shopId) : null,
                customerId: formData.customerId ? parseInt(formData.customerId) : null,
                items: formData.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes || null
            };

            const response = await salesAPI.create(payload);

            if (response.data.success) {
                alert(`✅ Sale created successfully!\nSale #: ${response.data.data.sale_number}\nAmount: Rs. ${formatCurrency(response.data.data.total_amount, false)}`);
                
                // Reset form
                setFormData({
                    websiteId: '',
                    shopId: '',
                    customerId: '',
                    items: [{ productId: '', quantity: 1 }],
                    paymentMethod: 'cash',
                    notes: ''
                });
                
                onSuccess?.();
                onClose?.();
            }
        } catch (err) {
            console.error('Sale creation failed:', err);
            setError(err.response?.data?.message || 'Failed to create sale');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Sale</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="form-error">{error}</div>}

                    {/* Website Selection */}
                    <div className="form-group">
                        <label className="form-label">Website *</label>
                        <select
                            className="form-input"
                            value={formData.websiteId}
                            onChange={handleWebsiteChange}
                            required
                        >
                            <option value="">Select Website</option>
                            {websites.map(website => (
                                <option key={website.id} value={website.id}>
                                    {website.name} ({website.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Products Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Products</h3>
                        </div>

                        <div className="items-table">
                            <div className="table-header">
                                <div className="col-product">Product</div>
                                <div className="col-price">Unit Price</div>
                                <div className="col-qty">Quantity</div>
                                <div className="col-total">Total</div>
                                <div className="col-action">Action</div>
                            </div>

                            {formData.items.map((item, index) => {
                                const product = products.find(p => p.id === item.productId);
                                const lineTotal = product ? product.unit_price * item.quantity : 0;

                                return (
                                    <div key={index} className="table-row">
                                        <div className="col-product">
                                            <select
                                                className="form-input"
                                                value={item.productId}
                                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(product => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-price">
                                            <span className="price-value">
                                                {product ? formatCurrency(product.unit_price, false) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="col-qty">
                                            <input
                                                type="number"
                                                className="form-input"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-total">
                                            <span className="price-value">{formatCurrency(lineTotal, false)}</span>
                                        </div>
                                        <div className="col-action">
                                            <button
                                                type="button"
                                                className="btn-icon btn-danger"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={addItem}
                            style={{ marginTop: '16px' }}
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>

                    {/* Totals */}
                    <div className="totals-section">
                        <div className="total-row">
                            <span className="total-label">Subtotal:</span>
                            <span className="total-value">{formatCurrency(totals.subtotal, false)}</span>
                        </div>
                        <div className="total-row">
                            <span className="total-label">Tax (17%):</span>
                            <span className="total-value">{formatCurrency(totals.tax, false)}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span className="total-label">Total Amount:</span>
                            <span className="total-value">{formatCurrency(totals.total, false)}</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <select
                            className="form-input"
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="online">Online Payment</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-input"
                            rows="3"
                            placeholder="Additional notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating Sale...' : 'Create Sale'}
                        </button>
                    </div>
                </form>

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
                        max-width: 800px;
                        width: 90%;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 24px;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .modal-header h2 {
                        font-size: 20px;
                        font-weight: 600;
                        color: #1f2937;
                        margin: 0;
                    }

                    .modal-close {
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #6b7280;
                        padding: 8px;
                    }

                    .modal-form {
                        padding: 24px;
                    }

                    .form-error {
                        background: #fee2e2;
                        color: #dc2626;
                        padding: 12px 16px;
                        border-radius: 8px;
                        margin-bottom: 16px;
                        font-size: 14px;
                    }

                    .form-group {
                        margin-bottom: 16px;
                    }

                    .form-label {
                        display: block;
                        font-size: 14px;
                        font-weight: 500;
                        color: #374151;
                        margin-bottom: 8px;
                    }

                    .form-input {
                        width: 100%;
                        padding: 10px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        font-family: inherit;
                    }

                    .form-input:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }

                    .form-section {
                        margin: 24px 0;
                        padding: 16px;
                        background: #f9fafb;
                        border-radius: 8px;
                    }

                    .section-header {
                        margin-bottom: 16px;
                    }

                    .section-header h3 {
                        font-size: 16px;
                        font-weight: 600;
                        color: #1f2937;
                        margin: 0;
                    }

                    .items-table {
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .table-header {
                        display: grid;
                        grid-template-columns: 2fr 1fr 1fr 1fr 80px;
                        gap: 12px;
                        padding: 12px;
                        background: #f3f4f6;
                        font-weight: 600;
                        font-size: 13px;
                        color: #6b7280;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .table-row {
                        display: grid;
                        grid-template-columns: 2fr 1fr 1fr 1fr 80px;
                        gap: 12px;
                        padding: 12px;
                        border-bottom: 1px solid #e5e7eb;
                        align-items: center;
                    }

                    .table-row:last-child {
                        border-bottom: none;
                    }

                    .col-product {
                        flex: 1;
                    }

                    .col-price {
                        text-align: right;
                    }

                    .col-qty {
                        text-align: center;
                    }

                    .col-total {
                        text-align: right;
                    }

                    .col-action {
                        text-align: center;
                    }

                    .price-value {
                        font-weight: 600;
                        color: #1f2937;
                    }

                    .btn-icon {
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 4px;
                        color: #dc2626;
                    }

                    .totals-section {
                        background: #f9fafb;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 24px 0;
                    }

                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        font-size: 14px;
                        color: #6b7280;
                    }

                    .grand-total {
                        border-top: 2px solid #e5e7eb;
                        padding-top: 12px;
                        padding-bottom: 0;
                        font-size: 16px;
                        font-weight: 600;
                        color: #1f2937;
                    }

                    .total-label {
                        font-weight: 500;
                    }

                    .total-value {
                        font-weight: 600;
                        color: #10b981;
                    }

                    .grand-total .total-value {
                        color: #059669;
                    }

                    .modal-actions {
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    }

                    .btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .btn-primary {
                        background: #3b82f6;
                        color: white;
                    }

                    .btn-primary:hover:not(:disabled) {
                        background: #2563eb;
                    }

                    .btn-secondary {
                        background: #e5e7eb;
                        color: #374151;
                    }

                    .btn-secondary:hover {
                        background: #d1d5db;
                    }

                    .btn-danger {
                        background: #fee2e2;
                        color: #dc2626;
                    }

                    .btn-danger:hover {
                        background: #fecaca;
                    }

                    .btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default CreateSale;
