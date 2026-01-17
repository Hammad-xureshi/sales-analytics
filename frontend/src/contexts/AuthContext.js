/**
 * ============================================
 * Authentication Context
 * Made by Hammad Naeem
 * ============================================
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.success) {
                const { token, user: userData } = response.data.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                setUser(userData);
                return { success: true };
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore logout API errors
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    }, []);

    const hasPermission = useCallback((permission) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    }, [user]);

    const isAdmin = useCallback(() => {
        return user?.role === 'Admin';
    }, [user]);

    const isManager = useCallback(() => {
        return user?.role === 'Manager' || user?.role === 'Admin';
    }, [user]);

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        hasPermission,
        isAdmin,
        isManager,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;