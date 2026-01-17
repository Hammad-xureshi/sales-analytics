/**
 * ============================================
 * Websites List Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { websitesAPI } from '../../services/api';
import Loading from '../common/Loading';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Globe, Store, Package, TrendingUp, RefreshCw } from 'lucide-react';

function WebsitesList() {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWebsites();
    }, []);

    const fetchWebsites = async () => {
        try {
            setLoading(true);
            const response = await websitesAPI.getAll();
            if (response.data.success) {
                setWebsites(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch websites:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Loading websites..." />;
    }

    return (
        <div className="websites-list">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <Globe size={20} style={{ marginRight: '8px' }} />
                        Websites & Online Stores
                    </h2>
                    <button className="btn btn-secondary btn-sm" onClick={fetchWebsites}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
                
                <div className="card-body">
                    <div className="websites-grid">
                        {websites.length === 0 ? (
                            <div className="empty-state">
                                <Globe className="empty-state-icon" />
                                <h3 className="empty-state-title">No Websites Found</h3>
                                <p className="empty-state-text">No websites have been configured yet.</p>
                            </div>
                        ) : (
                            websites.map((website) => (
                                <div key={website.id} className="website-card">
                                    <div className="website-card-header">
                                        <div className="website-icon">
                                            <Globe size={24} />
                                        </div>
                                        <div className="website-info">
                                            <h3 className="website-name">{website.name}</h3>
                                            <span className={`badge ${website.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {website.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="website-description">
                                        {website.description || 'No description available'}
                                    </div>
                                    
                                    <div className="website-category">
                                        <span className="badge badge-primary">{website.category || 'General'}</span>
                                    </div>
                                    
                                    <div className="website-stats">
                                        <div className="website-stat">
                                            <Store size={16} />
                                            <span>{website.shop_count || 0} Shops</span>
                                        </div>
                                        <div className="website-stat">
                                            <Package size={16} />
                                            <span>{website.product_count || 0} Products</span>
                                        </div>
                                    </div>
                                    
                                    <div className="website-revenue">
                                        <TrendingUp size={16} />
                                        <span>Today: {formatCurrency(website.today_revenue || 0)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .websites-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }
                .website-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s ease;
                }
                .website-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
                .website-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .website-icon {
                    width: 48px;
                    height: 48px;
                    background: #eff6ff;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                }
                .website-info {
                    flex: 1;
                }
                .website-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }
                .website-description {
                    font-size: 13px;
                    color: #64748b;
                    margin-bottom: 12px;
                    line-height: 1.5;
                }
                .website-category {
                    margin-bottom: 16px;
                }
                .website-stats {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 12px;
                }
                .website-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #64748b;
                }
                .website-revenue {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 12px;
                    border-top: 1px solid #e2e8f0;
                    font-size: 14px;
                    font-weight: 500;
                    color: #22c55e;
                }
            `}</style>
        </div>
    );
}

export default WebsitesList;