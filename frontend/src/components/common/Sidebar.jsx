/**
 * ============================================
 * Sidebar Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Globe, 
    Package, 
    Users, 
    BarChart3,
    Settings,
    FileText,
    Shield
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function Sidebar() {
    const location = useLocation();
    const { isAdmin } = useAuth();

    const navItems = [
        {
            section: 'Main',
            items: [
                { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/sales', icon: ShoppingCart, label: 'Sales' },
                { path: '/websites', icon: Globe, label: 'Websites' },
                { path: '/products', icon: Package, label: 'Products' }
            ]
        },
        {
            section: 'Analytics',
            items: [
                { path: '/reports', icon: BarChart3, label: 'Reports' },
                { path: '/insights', icon: FileText, label: 'Insights' }
            ]
        }
    ];

    if (isAdmin()) {
        navItems.push({
            section: 'Admin',
            items: [
                { path: '/admin', icon: Shield, label: 'Admin Control' },
                { path: '/users', icon: Users, label: 'Users' },
                { path: '/settings', icon: Settings, label: 'Settings' }
            ]
        });
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <BarChart3 size={28} />
                <div>
                    <h2>Sales Analytics</h2>
                    <p>ERP System</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section} className="nav-section">
                        <p className="section-title">{section.section}</p>
                        <ul className="nav-list">
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;

                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`nav-link ${isActive ? 'active' : ''}`}
                                        >
                                            <Icon size={20} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p>Developed by Hammad Naeem</p>
            </div>

            <style jsx>{`
                .sidebar {
                    width: 260px;
                    background: #1e293b;
                    color: white;
                    height: 100vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 100;
                }

                .sidebar-header {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .sidebar-header h2 {
                    margin: 0;
                    font-size: 18px;
                }

                .sidebar-header p {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.7;
                }

                .sidebar-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 0;
                }

                .nav-section {
                    margin-bottom: 20px;
                }

                .section-title {
                    padding: 0 20px;
                    margin: 0 0 8px 0;
                    font-size: 11px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .nav-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    color: #cbd5e1;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .nav-link:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                    padding-left: 24px;
                }

                .nav-link.active {
                    color: white;
                    background: #3b82f6;
                    border-left: 4px solid #60a5fa;
                }

                .sidebar-footer {
                    padding: 16px 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                }

                .sidebar-footer p {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.7;
                }

                @media (max-width: 768px) {
                    .sidebar {
                        width: 80px;
                    }

                    .sidebar-header {
                        flex-direction: column;
                        justify-content: center;
                    }

                    .sidebar-header h2,
                    .sidebar-header p {
                        display: none;
                    }

                    .section-title,
                    .nav-link span {
                        display: none;
                    }

                    .nav-link {
                        justify-content: center;
                        padding: 12px;
                    }

                    .nav-link:hover {
                        padding-left: 12px;
                    }

                    .sidebar-footer {
                        display: none;
                    }
                }
            `}</style>
        </aside>
    );
}

export default Sidebar;
