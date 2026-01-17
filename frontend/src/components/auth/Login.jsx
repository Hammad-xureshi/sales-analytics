/**
 * ============================================
 * Login Component
 * Made by Hammad Naeem
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BarChart3, Eye, EyeOff } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <BarChart3 size={32} />
                        </div>
                        <h1 className="login-title">Sales Analytics ERP</h1>
                        <p className="login-subtitle">Sign in to your account</p>
                    </div>
                    
                    <div className="login-body">
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="admin@saleserp.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                        
                        <div style={{ marginTop: '20px', padding: '16px', background: '#f1f5f9', borderRadius: '8px' }}>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                                <strong>Demo Credentials:</strong>
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>
                                Admin: admin@saleserp.com / admin123
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>
                                Manager: manager@saleserp.com / manager123
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>
                                Viewer: viewer@saleserp.com / viewer123
                            </p>
                        </div>
                    </div>
                    
                    <div className="login-footer">
                        <p>Made by <strong>Hammad Naeem</strong></p>
                        <p>Final Year Project - Sales Analytics ERP</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;