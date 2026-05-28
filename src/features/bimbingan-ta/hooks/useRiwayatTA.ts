'use client';

import { useState, useEffect, useCallback } from 'react';
import { studentTaService } from '@/services/studentTaService';
import type { StudentThesis } from '@/services/taService';

export function useRiwayatTA() {
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await studentTaService.getOwnThesis();
      setThesis((result as StudentThesis | null) ?? null);
    } catch (err: any) {
      console.error('[useRiwayatTA] Error:', err);
      // 404-like: backend returns data:null when no thesis — treat as empty, not error
      if (err?.response?.status === 404) {
        setThesis(null);
      } else {
        setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data riwayat pengajuan.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteSubmission = useCallback(async () => {
    if (!thesis?.id_student_thesis) return;

    setIsDeleting(true);
    setError(null);
    try {
      await studentTaService.deleteThesis(thesis.id_student_thesis);
      setThesis(null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Gagal menghapus pengajuan TA.');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [thesis?.id_student_thesis]);

  return { thesis, isLoading, isDeleting, error, refetch: fetchData, deleteSubmission };
