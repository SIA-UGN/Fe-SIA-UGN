'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesisPayload, ThesisLecturer } from '@/features/bimbingan-ta/types';
=======
import { studentTaService } from '@/services/studentTaService';
import type { Dosen, CreateTAPayload } from '@/services/taService';
>>>>>>> origin/main-rio

export function useAjukanTA() {
  const router = useRouter();

  const [lecturers, setLecturers] = useState<ThesisLecturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLecturers, setIsLoadingLecturers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLecturers = useCallback(async () => {
    setIsLoadingLecturers(true);
    try {
<<<<<<< HEAD
      const list = await studentThesisApi.getLecturers();
      setLecturers(list);
=======
      const list = await studentTaService.getLecturers();
      setDosenList(list as Dosen[]);
>>>>>>> origin/main-rio
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
<<<<<<< HEAD
        await studentThesisApi.createThesis(payload);
        router.push('/bimbingan-ta/mahasiswa/pengajuan');
      } catch (err: any) {
        setError(err?.userMessage ?? err?.message ?? 'Gagal mengajukan tugas akhir.');
=======
        // Step 1 — buat pengajuan TA
        const formData = new FormData();
        formData.append('title_ind', payload.title_ind);
        formData.append('title_eng', payload.title_eng);
        formData.append('description', payload.description);
        if (payload.topic) formData.append('topic', payload.topic);
        if (payload.attachment_proposal) formData.append('attachment_proposal', payload.attachment_proposal);

        const thesis = await studentTaService.createThesis(formData);
        const thesisId = Number(thesis?.id_student_thesis ?? 0);
        if (!thesisId) {
          throw new Error('ID pengajuan TA tidak ditemukan dari respons server.');
        }

        // Step 2 — kirim permintaan ke dosen yang dipilih
        await studentTaService.requestLecturer(thesisId, payload.id_lecturer, payload.student_note);

        router.push('/bimbingan/pengajuan');
      } catch (err: any) {
        console.error('[useAjukanTA] submit error:', err);

        if (err?.response?.status === 422) {
          const validationErrors = err.response.data?.errors;
          if (validationErrors) {
            const firstField = Object.keys(validationErrors)[0];
            const firstMsg = validationErrors[firstField]?.[0];
            setError(firstMsg || 'Data yang dikirim tidak valid.');
            return;
          }
        }

        setError(
          err?.response?.data?.message ??
          err?.userMessage ??
          err?.message ??
          'Gagal mengajukan tugas akhir.'
        );
>>>>>>> origin/main-rio
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { onSubmit, isLoading, isLoadingLecturers, lecturers, error };
}
