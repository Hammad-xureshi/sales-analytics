/**
 * ============================================
 * Toast Notification Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

function Toast({ message, type = 'success', duration = 5000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const bgColor = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    }[type];

    const Icon = {
        success: Check,
        error: AlertCircle,
        warning: AlertCircle,
        info: AlertCircle
    }[type];

    return (
        <div className="toast" style={{ backgroundColor: bgColor }}>
            <div className="toast-content">
                <Icon size={20} style={{ marginRight: '12px' }} />
                <span>{message}</span>
            </div>
            <button
                className="toast-close"
                onClick={() => {
                    setIsVisible(false);
                    onClose?.();
                }}
            >
                <X size={18} />
            </button>

            <style jsx>{`
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    z-index: 2000;
                    animation: slideIn 0.3s ease-out;
                    max-width: 400px;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    font-weight: 500;
                    font-size: 14px;
                }

                .toast-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }

                .toast-close:hover {
                    opacity: 1;
                }

                @media (max-width: 640px) {
                    .toast {
                        left: 10px;
                        right: 10px;
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
}

export default Toast;