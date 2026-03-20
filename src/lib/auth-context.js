"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { getProfile } from './profileApi';
import { buildImageUrl } from './utils';

// Bentuk data user minimal; kini termasuk avatar/image apabila tersedia.
const defaultUser = { username: null, roles: null, image: null, loading: true, name: null };

const AuthContext = createContext({
    user: defaultUser,
    setUser: () => {},
    refreshUser: async () => {},
    logoutLocal: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(defaultUser);

    const fetchProfile = useCallback(async () => {
        // Jika tidak ada token -> anggap belum login
        console.log('Fetching profile in AuthProvider...');
        const token = Cookies.get('token');
        if (!token) {
            setUser({ username: null, roles: null, image: null, loading: false, name: null });
        return;
        }
        try {
        const response = await getProfile();
        const image = buildImageUrl(response.data.profile_image);
        setUser({ username: response.data.username, roles: response.data.role, image, loading: false, name: response.data.name });
        if (response.data.username) {
            Cookies.set('name', response.data.username);
        }
        } catch (e) {
        console.warn('Gagal fetch profil:', e?.response?.data || e.message);
        setUser({ username: null, roles: null, image: null, loading: false, name: null });
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const refreshUser = fetchProfile;

    const logoutLocal = () => {
        Cookies.remove('token');
        Cookies.remove('roles');
        Cookies.remove('name');
        Cookies.remove('user_id'); // Clear user ID from cookies
        // PENTING: Clear localStorage user data untuk WebSocket
        localStorage.removeItem('user');
        console.log('[Logout] User data cleared from cookies and localStorage');
    setUser({ name: null, roles: [], image: null, loading: false });
    };

    return (
        <AuthContext.Provider value={{ user, setUser, refreshUser, logoutLocal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
