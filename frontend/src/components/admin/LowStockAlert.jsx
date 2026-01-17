/**
 * ============================================
 * Low Stock Alert Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';

function LowStockAlert({ products }) {
    const criticalProducts = products.filter(p => p.stock_quantity === 0);
    const warningProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < p.reorder_level);

    return (
        <div className="alert-container">
            {criticalProducts.length > 0 && (
                <div className="alert alert-critical">
                    <div className="alert-icon critical">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="alert-content">
                        <h3>🚨 CRITICAL: {criticalProducts.length} Products Out of Stock</h3>
                        <div className="product-list">
                            {criticalProducts.slice(0, 3).map(p => (
                                <div key={p.id} className="product-item">
                                    <span className="product-name">{p.name}</span>
                                    <span className="product-sku">{p.sku}</span>
                                </div>
                            ))}
                            {criticalProducts.length > 3 && (
                                <p className="more-items">+{criticalProducts.length - 3} more items</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {warningProducts.length > 0 && (
                <div className="alert alert-warning">
                    <div className="alert-icon warning">
                        <TrendingDown size={24} />
                    </div>
                    <div className="alert-content">
                        <h3>⚠️ WARNING: {warningProducts.length} Products Below Reorder Level</h3>
                        <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.9 }}>
                            Consider ordering stock soon
                        </p>
                    </div>
                </div>
            )}

            <style jsx>{`
                .alert-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid;
                }

                .alert-critical {
                    background: #fef2f2;
                    border-color: #dc2626;
                    color: #991b1b;
                }

                .alert-warning {
                    background: #fefce8;
                    border-color: #b45309;
                    color: #92400e;
                }

                .alert-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                }

                .alert-icon.critical {
                    background: rgba(220, 38, 38, 0.1);
                    color: #dc2626;
                }

                .alert-icon.warning {
                    background: rgba(180, 83, 9, 0.1);
                    color: #b45309;
                }

                .alert-content h3 {
                    margin: 0 0 12px 0;
                    font-size: 15px;
                    font-weight: 700;
                }

                .product-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .product-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                    font-size: 13px;
                }

                .product-name {
                    font-weight: 600;
                }

                .product-sku {
                    font-size: 11px;
                    opacity: 0.7;
                    font-family: monospace;
                }

                .more-items {
                    margin: 0;
                    font-size: 12px;
                    font-weight: 600;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}

export default LowStockAlert;