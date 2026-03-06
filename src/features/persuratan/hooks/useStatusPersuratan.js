'use client';

import { useState, useEffect, useCallback } from 'react';
import { correspondenceService } from '@/types/correspondence';

/**
 * Custom hook for the "Status Persuratan" page.
 * Fetches all correspondence data, manages loading/error states,
 * and provides a delete function with optimistic update.
 */
export function useStatusPersuratan() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

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

    /**
     * Delete a letter by ID.
     * Optimistically removes the item from local state on success.
     */
    const deleteLetter = useCallback(async (id) => {
        setIsDeleting(true);
        setDeletingId(id);
        try {
            await correspondenceService.delete(id);
            // Optimistic: remove from local state
            setData((prev) => prev.filter((item) => item.id_correspondence !== id));
        } catch (err) {
            console.error('[useStatusPersuratan] Delete error:', err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal menghapus surat.'
            );
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    }, []);

    return {
        data,
        isLoading,
        error,
        isDeleting,
        deletingId,
        refetch: fetchData,
        deleteLetter,
    };
}
