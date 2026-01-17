/**
 * ============================================
 * Socket.io Context
 * Made by Hammad Naeem
 * ============================================
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [newSaleAlert, setNewSaleAlert] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io(
            process.env.REACT_APP_API_URL || 'http://localhost:5000',
            {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling']
            }
        );

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected:', socketInstance.id);
            setIsConnected(true);
            // Join dashboard room
            socketInstance.emit('join_dashboard');
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('new_sale_alert', (data) => {
            console.log('🔔 New sale alert:', data);
            setNewSaleAlert(data);
        });

        socketInstance.on('stats_update', (data) => {
            console.log('📊 Stats update:', data);
        });

        socketInstance.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        setSocket(socketInstance);

        // Cleanup
        return () => {
            socketInstance.emit('leave_dashboard');
            socketInstance.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, newSaleAlert, setNewSaleAlert }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
}