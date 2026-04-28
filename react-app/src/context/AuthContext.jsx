import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState({
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role')
    });

    const login = (userData, newToken, refreshToken) => {
        localStorage.setItem('token', newToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userData._id || userData.userId);
        localStorage.setItem('username', userData.username);
        if (userData.role) localStorage.setItem('role', userData.role);

        setToken(newToken);
        setUser({
            userId: userData._id || userData.userId,
            username: userData.username,
            role: userData.role || 'user'
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    useEffect(() => {
        const handleStorageChange = () => {
             setToken(localStorage.getItem('token'));
             setUser({
                 userId: localStorage.getItem('userId'),
                 username: localStorage.getItem('username'),
                 role: localStorage.getItem('role')
             });
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
