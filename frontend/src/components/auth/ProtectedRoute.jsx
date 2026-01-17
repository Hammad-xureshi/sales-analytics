/**
 * ============================================
 * Protected Route Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

function ProtectedRoute({ children, requiredRole, requiredPermission }) {
    const { isAuthenticated, loading, user, hasPermission } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading message="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;