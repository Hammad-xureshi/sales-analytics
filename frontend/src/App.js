/**
 * ============================================
 * Main App Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import SalesList from './components/sales/SalesList';
import WebsitesList from './components/websites/WebsitesList';
import ProductsList from './components/products/ProductsList';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="content-area">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <Dashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <Dashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <AppLayout>
                                        <AdminDashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sales"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <SalesList />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/websites"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <WebsitesList />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/products"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <ProductsList />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;