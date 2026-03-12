'use client';

import { useState, useEffect, useCallback } from 'react';
import { correspondenceService } from '@/types/correspondence';
import type { Correspondence } from '@/types/correspondence.d';

/**
 * Hook to fetch and manage the detail of a single correspondence.
 *
 * @param id - The correspondence ID (from the dynamic route param).
 * @returns  `data`, `isLoading`, `error`, and a `refetch` helper.
 */
export function useAdminDetailSurat(id: number | null) {
    const [data, setData] = useState<Correspondence | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        const MAX_RETRIES = 2;
        const RETRY_DELAY_MS = 3000;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await correspondenceService.getDetail(id);
                setData(result);
                setIsLoading(false);
                return;
            } catch (err: any) {
                const isLast = attempt === MAX_RETRIES;
                const isConnectivity = err?.isConnectivityError || err?.code === 'ECONNABORTED';

                if (!isLast && isConnectivity) {
                    // wait before retrying
                    await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
                    continue;
                }

                console.error('[useAdminDetailSurat] Error:', err);
                setError(
                    err?.userMessage ||
                    err?.response?.data?.message ||
                    err?.message ||
                    'Gagal memuat detail surat.',
                );
                break;
            }
        }

        setIsLoading(false);
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { data, isLoading, error, refetch: fetchDetail };
}
