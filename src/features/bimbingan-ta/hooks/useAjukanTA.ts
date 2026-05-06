'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesisPayload, ThesisLecturer } from '@/features/bimbingan-ta/types';

export function useAjukanTA() {
  const router = useRouter();

  const [lecturers, setLecturers] = useState<ThesisLecturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLecturers, setIsLoadingLecturers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLecturers = useCallback(async () => {
    setIsLoadingLecturers(true);
    try {
      const list = await studentThesisApi.getLecturers();
      setLecturers(list);
    } catch (err: any) {
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat daftar dosen.');
    } finally {
      setIsLoadingLecturers(false);
    }
  }, []);

  useEffect(() => {
    fetchLecturers();
  }, [fetchLecturers]);

  const onSubmit = useCallback(
    async (payload: StudentThesisPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        await studentThesisApi.createThesis(payload);
        router.push('/bimbingan-ta/mahasiswa/pengajuan');
      } catch (err: any) {
        setError(err?.userMessage ?? err?.message ?? 'Gagal mengajukan tugas akhir.');
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { onSubmit, isLoading, isLoadingLecturers, lecturers, error };
}
