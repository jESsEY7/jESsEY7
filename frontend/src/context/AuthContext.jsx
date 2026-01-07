import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client, { getErrorMessage, checkApiHealth } from '@/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiHealthy, setApiHealthy] = useState(true);

    // Check API health on mount
    useEffect(() => {
        const verifyApi = async () => {
            const health = await checkApiHealth();
            setApiHealthy(health.ok);
            if (!health.ok) {
                console.warn('[Auth] API health check failed:', health.error);
            }
        };
        verifyApi();
    }, []);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            setUser(null);
            return;
        }

        try {
            const response = await client.get('/users/me/');
            setUser(response.data);
            setError(null);
        } catch (err) {
            console.error("[Auth] Check failed:", getErrorMessage(err));

            // Only clear user if it's an auth error, not a network error
            if (!err.isNetworkError) {
                setUser(null);
            }
            setError(err.isNetworkError ? 'Unable to connect to server' : null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        setError(null);

        try {
            const response = await client.post('/auth/login/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            client.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // Fetch user details after login
            await checkAuth();

            return { success: true };
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            throw new Error(message);
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete client.defaults.headers.common['Authorization'];
        setUser(null);
        setError(null);
    }, []);

    const register = async (userData) => {
        setError(null);

        // Validate required fields
        if (!userData.username || !userData.email || !userData.password) {
            throw new Error('Username, email and password are required');
        }

        // Prepare payload matching backend expectations
        const payload = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
        };

        // Add optional fields if provided
        if (userData.first_name) payload.first_name = userData.first_name;
        if (userData.last_name) payload.last_name = userData.last_name;
        if (userData.full_name) {
            // Split full_name into first and last
            const [first, ...rest] = userData.full_name.split(' ');
            payload.first_name = first;
            payload.last_name = rest.join(' ');
        }

        try {
            const response = await client.post('/users/', payload);
            return { success: true, data: response.data };
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            throw new Error(message);
        }
    };

    const value = {
        user,
        loading,
        error,
        apiHealthy,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        checkAuth,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
