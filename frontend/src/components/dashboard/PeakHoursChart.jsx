/**
 * ============================================
 * Website Comparison Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { analyticsAPI } from '../../services/api';
import Loading from '../common/Loading';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function WebsiteComparison() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await analyticsAPI.getWebsiteComparison('month');
            if (response.data.success) {
                setData(response.data.data
                    .filter(item => parseFloat(item.total_revenue) > 0)
                    .map(item => ({
                        name: item.website_name,
                        value: parseFloat(item.total_revenue),
                        sales: parseInt(item.total_sales)
                    }))
                );
            }
        } catch (err) {
            console.error('Failed to fetch website comparison:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderLabel = ({ name, percent }) => {
        return `${name} (${(percent * 100).toFixed(0)}%)`;
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Revenue by Website</h3>
            </div>
            
            {loading ? (
                <Loading message="Loading..." />
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <p>No revenue data available</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={renderLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value) => formatCurrency(value)}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default WebsiteComparison;