'use client';

import { useState, useEffect, useCallback } from 'react';
import { correspondenceService } from '@/types/correspondence';

/**
 * Custom hook for the "Status Persuratan" page.
 * Fetches all correspondence data and manages loading/error states.
 * Zero UI awareness — returns only data and state.
 */
export function useStatusPersuratan() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await correspondenceService.getAll();
            setData(result || []);
        } catch (err) {
            console.error('[useStatusPersuratan] Error:', err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal memuat data persuratan.'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
    };
}
