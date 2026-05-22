'use client';

import { useState, useCallback } from 'react';
import {
    useCorrespondenceListQuery,
    useDeleteCorrespondenceMutation,
} from '@/features/persuratan/hooks/useCorrespondenceQueries';

/**
 * Custom hook for the "Status Persuratan" page.
 * Fetches all correspondence data, manages loading/error states,
 * and provides a delete function with optimistic update.
 */
export function useStatusPersuratan() {
    const [deletingId, setDeletingId] = useState(null);
    const [actionError, setActionError] = useState(null);

    const listQuery = useCorrespondenceListQuery();
    const deleteMutation = useDeleteCorrespondenceMutation();

    /**
     * Delete a letter by ID.
     * Optimistically removes the item from local state on success.
     */
    const deleteLetter = useCallback(async (id) => {
        setDeletingId(id);
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) {
            console.error('[useStatusPersuratan] Delete error:', err);
            setActionError(
                err?.userMessage ||
                err?.message ||
                'Gagal menghapus surat.'
            );
        } finally {
            setDeletingId(null);
        }
    }, [deleteMutation]);

    const errorMessage =
        actionError ||
        listQuery.error?.userMessage ||
        listQuery.error?.message ||
        listQuery.error?.response?.data?.message ||
        null;

    return {
        data: listQuery.data || [],
        isLoading: listQuery.isLoading,
        error: errorMessage,
        isDeleting: deleteMutation.isPending,
        deletingId,
        refetch: listQuery.refetch,
        deleteLetter,
    };
}
