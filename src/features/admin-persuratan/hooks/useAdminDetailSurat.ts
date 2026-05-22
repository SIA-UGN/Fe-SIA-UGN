'use client';

import { useMemo } from 'react';
import type { Correspondence } from '@/types/correspondence.d';
import { useCorrespondenceDetailQuery } from '@/features/persuratan/hooks/useCorrespondenceQueries';

/**
 * Hook to fetch and manage the detail of a single correspondence.
 *
 * @param id - The correspondence ID (from the dynamic route param).
 * @returns  `data`, `isLoading`, `error`, and a `refetch` helper.
 */
export function useAdminDetailSurat(id: number | null) {
    const detailQuery = useCorrespondenceDetailQuery(id, { enabled: Boolean(id) });

    const error = useMemo(() => {
        return (
            detailQuery.error?.userMessage ||
            detailQuery.error?.message ||
            null
        );
    }, [detailQuery.error]);

    return {
        data: (detailQuery.data as Correspondence) || null,
        isLoading: detailQuery.isLoading,
        error,
        refetch: detailQuery.refetch,
    };
}
