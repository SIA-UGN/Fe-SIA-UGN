'use client';

import { useState, useEffect, useCallback } from 'react';
import { taService, type PengajuanTA } from '@/services/taService';

export function useRiwayatTA() {
  const [data, setData] = useState<PengajuanTA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await taService.getAll();
      setData(result);
    } catch (err: any) {
      console.error('[useRiwayatTA] Error:', err);
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data riwayat pengajuan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
