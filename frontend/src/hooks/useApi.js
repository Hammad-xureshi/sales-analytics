/**
 * ============================================
 * useApi Hook for data fetching
 * Made by Hammad Naeem
 * ============================================
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useApi(endpoint, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { 
        immediate = true, 
        refreshInterval = null,
        dependencies = []
    } = options;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get(endpoint);
            
            if (response.data.success) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to fetch data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData, ...dependencies]);

    // Auto-refresh
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    return { data, loading, error, refetch };
}

export default useApi;