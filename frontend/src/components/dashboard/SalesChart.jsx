/**
 * ============================================
 * Sales Chart Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI } from '../../services/api';
import Loading from '../common/Loading';

function SalesChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(7);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await analyticsAPI.getDailySales(period);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch sales chart data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatXAxis = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
    };

    const formatTooltip = (value, name) => {
        if (name === 'revenue') {
            return [`Rs. ${value.toLocaleString()}`, 'Revenue'];
        }
        return [value, 'Sales'];
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Sales Trend</h3>
                <select 
                    className="form-select" 
                    style={{ width: 'auto' }}
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                </select>
            </div>
            
            {loading ? (
                <Loading message="Loading chart..." />
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatXAxis}
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis 
                            yAxisId="left"
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right"
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip formatter={formatTooltip} />
                        <Legend />
                        <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="salesCount" 
                            name="Sales"
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6' }}
                        />
                        <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="revenue" 
                            name="Revenue"
                            stroke="#22c55e" 
                            strokeWidth={2}
                            dot={{ fill: '#22c55e' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default SalesChart;