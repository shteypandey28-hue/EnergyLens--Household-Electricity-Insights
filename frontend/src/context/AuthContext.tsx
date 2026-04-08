import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'free' | 'basic' | 'premium' | 'admin';
    state: string;
    tariffType?: string;
    monthlyBudget?: number;
    isEmailVerified?: boolean;
    authProvider?: 'local' | 'google';
    profilePicture?: string;
    avatar?: string;
    phone?: string;
    subscriptionExpiry?: string;
    notificationPreferences?: {
        email: boolean;
        budgetAlert: boolean;
        peakHourAlert: boolean;
        anomalyAlert: boolean;
    };
    extraApplianceSlots?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    googleLogin: (credential: string) => Promise<{ needsOnboarding?: boolean; isNewUser?: boolean }>;
    updateProfile: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Sync axios header whenever token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Restore session on mount
    useEffect(() => {
        const checkUser = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${BASE}/me`);
                    setUser(res.data);
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        checkUser();
    }, [token]);

    const login = async (data: any) => {
        const res = await axios.post(`${BASE}/login`, data);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        // Fetch full user profile
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        const me = await axios.get(`${BASE}/me`);
        setUser(me.data);
    };

    const register = async (data: any) => {
        const res = await axios.post(`${BASE}/register`, data);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        const me = await axios.get(`${BASE}/me`);
        setUser(me.data);
    };

    const googleLogin = async (credential: string) => {
        const res = await axios.post(`${BASE}/google`, { credential });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        const me = await axios.get(`${BASE}/me`);
        setUser(me.data);
        return {
            needsOnboarding: res.data.needsOnboarding,
            isNewUser: res.data.isNewUser,
        };
    };

    const updateProfile = async (data: any) => {
        const res = await axios.put(`${BASE}/profile`, data);
        // Merge updated fields into local user state
        setUser(prev => prev ? { ...prev, ...res.data } : res.data);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        // Redirect to landing page, not login
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, googleLogin, updateProfile, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
