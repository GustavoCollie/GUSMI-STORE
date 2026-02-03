import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCustomer, registerCustomer } from '../services/api';

const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('customer_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // In a real app, we might verify the token or fetch current user profile
            // For now, we'll decode basic info from token if possible or just trust the presence
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCustomer({
                    id: payload.sub,
                    email: payload.email,
                    fullName: payload.full_name || 'Usuario'
                });
            } catch (e) {
                console.error("Error decoding token:", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (credentials) => {
        const response = await loginCustomer(credentials);
        localStorage.setItem('customer_token', response.access_token);
        setToken(response.access_token);
        return response;
    };

    const register = async (data) => {
        const response = await registerCustomer(data);
        localStorage.setItem('customer_token', response.access_token);
        setToken(response.access_token);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('customer_token');
        setToken(null);
        setCustomer(null);
    };

    return (
        <CustomerAuthContext.Provider value={{ customer, token, login, register, logout, loading }}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
