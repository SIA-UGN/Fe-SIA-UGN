'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboardStatistics } from '@/lib/adminApi';

/**
 * Custom hook for fetching admin dashboard statistics.
 * Extracts the data-fetching logic from the admin dashboard page.
 */
export function useDashboardStats() {
    const [statistics, setStatistics] = useState({
        total_subjects: 0,
        total_students: 0,
        total_lecturers: 0,
        total_classes: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getDashboardStatistics();

            if (response.status === 'success') {
                setStatistics(response.data);
            } else {
                setError('Gagal mengambil data statistik');
            }
        } catch (err) {
            console.error('[useDashboardStats] Error:', err);
            setError(err.message || 'Terjadi kesalahan saat mengambil data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    return {
        statistics,
        isLoading,
        error,
        refetch: fetchStatistics,
    };
}
