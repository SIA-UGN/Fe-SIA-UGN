'use client';

import { useState, useEffect, useCallback } from 'react';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesis } from '@/features/bimbingan-ta/types';

export function useCurrentThesis() {
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await studentThesisApi.getCurrentThesis();
      setThesis(result);
    } catch (err: any) {
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data TA.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { thesis, isLoading, error, refetch: fetchData };
}

export const useRiwayatTA = useCurrentThesis;
