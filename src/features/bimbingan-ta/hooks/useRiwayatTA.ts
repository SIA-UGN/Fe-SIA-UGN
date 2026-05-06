'use client';

import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesis } from '@/features/bimbingan-ta/types';

export function useCurrentThesis() {
=======
import { studentTaService } from '@/services/studentTaService';
import type { StudentThesis } from '@/services/taService';

export function useRiwayatTA() {
>>>>>>> origin/main-rio
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
      const result = await studentThesisApi.getCurrentThesis();
      setThesis(result);
    } catch (err: any) {
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data TA.');
=======
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
>>>>>>> origin/main-rio
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

<<<<<<< HEAD
  return { thesis, isLoading, error, refetch: fetchData };
=======
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
>>>>>>> origin/main-rio
}

export const useRiwayatTA = useCurrentThesis;
