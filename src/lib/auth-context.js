"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { getProfile } from './profileApi';
import { buildImageUrl } from './utils';

// Bentuk data user minimal; kini termasuk avatar/image apabila tersedia.
const defaultUser = {
    username: null,
    roles: null,
    image: null,
    loading: true,
    name: null,
    id_program: null,
    program: null,
};

function resolveProgramId(profileData) {
    const candidates = [
        profileData?.id_program,
        profileData?.program?.id_program,
        profileData?.program_id,
        profileData?.staff_data?.id_program,
        profileData?.staff_profile?.id_program,
        profileData?.staff?.id_program,
        profileData?.study_program?.id_program,
    ];

    for (const value of candidates) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    return null;
}

function resolveProgramObject(profileData) {
    const program = profileData?.program || profileData?.staff_data?.program || profileData?.staff_profile?.program || null;
    if (!program) return null;
    return {
        id_program: Number(program?.id_program || program?.id || 0) || null,
        name: program?.name || program?.program_name || null,
    };
}

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
            setUser({
                username: null,
                roles: null,
                image: null,
                loading: false,
                name: null,
                id_program: null,
                program: null,
            });
        return;
        }
        try {
        const response = await getProfile();
        const profileData = response?.data || {};
        const image = buildImageUrl(profileData.profile_image);
        const idProgram = resolveProgramId(profileData);
        const program = resolveProgramObject(profileData);
        setUser({
            username: profileData.username,
            roles: profileData.role,
            image,
            loading: false,
            name: profileData.name,
            id_program: idProgram,
            program,
        });
        if (response.data.username) {
            Cookies.set('name', response.data.username);
        }
        } catch (e) {
        console.warn('Gagal fetch profil:', e?.response?.data || e.message);
        setUser({
            username: null,
            roles: null,
            image: null,
            loading: false,
            name: null,
            id_program: null,
            program: null,
        });
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
    setUser({
        name: null,
        roles: [],
        image: null,
        loading: false,
        username: null,
        id_program: null,
        program: null,
    });
    };

    return (
        <AuthContext.Provider value={{ user, setUser, refreshUser, logoutLocal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
