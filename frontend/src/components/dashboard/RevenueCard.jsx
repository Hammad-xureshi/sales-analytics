/**
 * ============================================
 * Revenue Card Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import Loading from '../common/Loading';

function RevenueCard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await analyticsAPI.getTopProducts(10, 'month');
            if (response.data.success) {
                setData(response.data.data.map(item => ({
                    name: item.product_name?.substring(0, 20) || 'Unknown',
                    quantity: parseInt(item.total_quantity),
                    revenue: parseFloat(item.total_revenue)
                })));
            }
        } catch (err) {
            console.error('Failed to fetch top products:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Top Selling Products</h3>
            </div>
            
            {loading ? (
                <Loading message="Loading..." />
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <p>No sales data available</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" fontSize={12} />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={11}
                            width={100}
                        />
                        <Tooltip 
                            formatter={(value, name) => {
                                if (name === 'revenue') return [`Rs. ${value.toLocaleString()}`, 'Revenue'];
                                return [value, 'Quantity'];
                            }}
                        />
                        <Bar dataKey="quantity" fill="#3b82f6" name="Quantity" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default RevenueCard;