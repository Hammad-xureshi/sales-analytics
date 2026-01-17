/**
 * ============================================
 * Header Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Bell, Settings } from 'lucide-react';

function Header() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">Dashboard</h1>
            </div>
            
            <div className="header-right">
                <button className="btn btn-secondary btn-sm" title="Notifications">
                    <Bell size={18} />
                </button>
                
                <button className="btn btn-secondary btn-sm" title="Settings">
                    <Settings size={18} />
                </button>
                
                <div className="header-user">
                    <div className="user-info">
                        <div className="user-name">{user?.firstName} {user?.lastName}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                    <div className="user-avatar">
                        {getInitials(user?.firstName, user?.lastName)}
                    </div>
                </div>
                
                <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}

export default Header;