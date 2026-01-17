/**
 * ============================================
 * Sales Control Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { salesAPI } from '../../services/api';
import Toast from '../common/Toast';

function SalesControl() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockedSales, setBlockedSales] = useState(new Set());
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            setLoading(true);
            // Fetch recent sales
            const response = await salesAPI.getAll({ limit: 100 });
            if (response.data.success) {
                setSales(response.data.data);
            }
        } catch (error) {
            addToast('Failed to load sales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockSale = (saleId) => {
        setBlockedSales(prev => {
            const newSet = new Set(prev);
            if (newSet.has(saleId)) {
                newSet.delete(saleId);
                addToast('Sale unblocked', 'success');
            } else {
                newSet.add(saleId);
                addToast('Sale blocked from cancellation', 'success');
            }
            return newSet;
        });
    };

    const addToast = (message, type) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading sales...</div>;
    }

    return (
        <div className="sales-control">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                />
            ))}

            <div className="control-info">
                <AlertTriangle size={20} />
                <div>
                    <h4>Sales Blocking Control</h4>
                    <p>Lock important sales to prevent accidental cancellation or modification</p>
                </div>
            </div>

            <div className="sales-table">
                <div className="table-header">
                    <div className="col-id">Sale ID</div>
                    <div className="col-date">Date</div>
                    <div className="col-amount">Amount</div>
                    <div className="col-status">Status</div>
                    <div className="col-action">Lock Status</div>
                </div>

                {sales.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No sales found
                    </div>
                ) : (
                    sales.map(sale => {
                        const isBlocked = blockedSales.has(sale.id);
                        return (
                            <div key={sale.id} className="table-row">
                                <div className="col-id">
                                    <code>{sale.sale_number}</code>
                                </div>
                                <div className="col-date">
                                    {new Date(sale.sale_date).toLocaleDateString()}
                                </div>
                                <div className="col-amount">
                                    <strong>{formatCurrency(sale.total_amount)}</strong>
                                </div>
                                <div className="col-status">
                                    <span className={`status-badge ${sale.payment_status || 'pending'}`}>
                                        {sale.payment_status || 'Pending'}
                                    </span>
                                </div>
                                <div className="col-action">
                                    <button
                                        className={`btn-lock ${isBlocked ? 'locked' : 'unlocked'}`}
                                        onClick={() => handleBlockSale(sale.id)}
                                    >
                                        {isBlocked ? (
                                            <>
                                                <Lock size={16} />
                                                Locked
                                            </>
                                        ) : (
                                            <>
                                                <Unlock size={16} />
                                                Unlock
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style jsx>{`
                .sales-control {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .control-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    border-radius: 8px;
                    color: #b45309;
                }

                .control-info h4 {
                    margin: 0 0 4px 0;
                    font-weight: 700;
                }

                .control-info p {
                    margin: 0;
                    font-size: 13px;
                }

                .sales-table {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr 1fr 1.5fr;
                    gap: 12px;
                    padding: 16px;
                    background: #f3f4f6;
                    font-weight: 600;
                    font-size: 13px;
                    color: #475569;
                    border-bottom: 1px solid #e5e7eb;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr 1fr 1.5fr;
                    gap: 12px;
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                    align-items: center;
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .table-row:hover {
                    background: #f9fafb;
                }

                .col-id code {
                    background: #f3f4f6;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .status-badge.pending {
                    background: #fef3c7;
                    color: #b45309;
                }

                .status-badge.completed {
                    background: #d1fae5;
                    color: #059669;
                }

                .status-badge.cancelled {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .btn-lock {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                    font-size: 13px;
                }

                .btn-lock.locked {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .btn-lock.locked:hover {
                    background: #fecaca;
                }

                .btn-lock.unlocked {
                    background: #e0e7ff;
                    color: #4f46e5;
                }

                .btn-lock.unlocked:hover {
                    background: #c7d2fe;
                }

                @media (max-width: 768px) {
                    .table-header,
                    .table-row {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .col-id::before {
                        content: 'Sale ID: ';
                        font-weight: 600;
                    }

                    .col-date::before {
                        content: 'Date: ';
                        font-weight: 600;
                    }

                    .col-amount::before {
                        content: 'Amount: ';
                        font-weight: 600;
                    }
                }
            `}</style>
        </div>
    );
}

export default SalesControl;