/**
 * ============================================
 * API Service
 * Made by Hammad Naeem
 * ============================================
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API methods
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    changePassword: (currentPassword, newPassword) => 
        api.post('/auth/change-password', { currentPassword, newPassword })
};

export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getSalesSummary: (period) => api.get(`/analytics/sales/summary?period=${period}`),
    getHourlySales: (date, websiteId) => 
        api.get(`/analytics/sales/hourly?date=${date || ''}&websiteId=${websiteId || ''}`),
    getDailySales: (days, websiteId) => 
        api.get(`/analytics/sales/daily?days=${days}&websiteId=${websiteId || ''}`),
    getMonthlySales: (months) => api.get(`/analytics/sales/monthly?months=${months}`),
    getWebsiteComparison: (period) => api.get(`/analytics/websites/comparison?period=${period}`),
    getWebsitePerformance: () => api.get('/analytics/websites/performance'),
    getTopProducts: (limit, period) => 
        api.get(`/analytics/products/top-selling?limit=${limit}&period=${period}`),
    getPeakHours: (days) => api.get(`/analytics/peak-hours?days=${days}`),
    getRealTimeCounter: () => api.get('/analytics/realtime/counter'),
    getTrends: () => api.get('/analytics/trends')
};

export const salesAPI = {
    getAll: (params) => api.get('/sales', { params }),
    getById: (id) => api.get(`/sales/${id}`),
    getRecent: () => api.get('/sales/recent'),
    getToday: (websiteId) => api.get(`/sales/today?websiteId=${websiteId || ''}`),
    create: (data) => api.post('/sales', data),
    updateStatus: (id, data) => api.put(`/sales/${id}/status`, data)
};

export const websitesAPI = {
    getAll: (params) => api.get('/websites', { params }),
    getById: (id) => api.get(`/websites/${id}`),
    getProducts: (id) => api.get(`/websites/${id}/products`),
    getShops: (id) => api.get(`/websites/${id}/shops`),
    getStats: (id, period) => api.get(`/websites/${id}/stats?period=${period}`),
    create: (data) => api.post('/websites', data),
    update: (id, data) => api.put(`/websites/${id}`, data),
    delete: (id) => api.delete(`/websites/${id}`)
};

export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    getLowStock: () => api.get('/products/low-stock'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    updateStock: (id, quantity, operation) => 
        api.patch(`/products/${id}/stock`, { quantity, operation }),
    delete: (id) => api.delete(`/products/${id}`)
};

export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    getRoles: () => api.get('/users/roles'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`)
};

export default api;