/**
 * ============================================
 * Live Sales Counter Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';

function LiveSalesCounter() {
    const [data, setData] = useState({
        today: { sales: 0, revenue: 0 },
        lastHour: { sales: 0, revenue: 0 },
        lastFiveMinutes: { sales: 0, revenue: 0 },
        latestSale: null
    });

    useEffect(() => {
        fetchData();
        
        // Refresh every 10 seconds for real-time effect
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const response = await analyticsAPI.getRealTimeCounter();
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch real-time data:', err);
        }
    };

    return (
        <div className="live-counter">
            <div className="live-counter-header">
                <h2 className="live-counter-title">Real-Time Sales Monitor</h2>
                <div className="live-indicator">
                    <span className="live-dot"></span>
                    <span>Live</span>
                </div>
            </div>
            
            <div className="live-counter-stats">
                <div className="live-stat">
                    <div className="live-stat-value">{formatNumber(data.today?.sales || 0)}</div>
                    <div className="live-stat-label">Today's Orders</div>
                </div>
                
                <div className="live-stat">
                    <div className="live-stat-value">{formatCurrency(data.today?.revenue || 0, false)}</div>
                    <div className="live-stat-label">Today's Revenue</div>
                </div>
                
                <div className="live-stat">
                    <div className="live-stat-value">{data.lastHour?.sales || 0}</div>
                    <div className="live-stat-label">Last Hour</div>
                </div>
                
                <div className="live-stat">
                    <div className="live-stat-value">{data.lastFiveMinutes?.sales || 0}</div>
                    <div className="live-stat-label">Last 5 Min</div>
                </div>
            </div>
            
            {data.latestSale && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '12px 16px', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    fontSize: '14px'
                }}>
                    <strong>Latest Sale:</strong> {data.latestSale.sale_number} - 
                    {formatCurrency(data.latestSale.total_amount)} from {data.latestSale.website_name}
                </div>
            )}
        </div>
    );
}

export default LiveSalesCounter;