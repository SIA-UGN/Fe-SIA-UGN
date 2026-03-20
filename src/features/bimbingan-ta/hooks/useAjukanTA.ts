'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { studentTaService } from '@/services/studentTaService';
import type { Dosen, CreateTAPayload } from '@/services/taService';

export function useAjukanTA() {
  const router = useRouter();

  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDosen, setIsLoadingDosen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Fetch dosen list on mount ───────────────────────────── */
  const fetchDosen = useCallback(async () => {
    setIsLoadingDosen(true);
    try {
      const list = await studentTaService.getLecturers();
      setDosenList(list as Dosen[]);
    } catch (err: any) {
      console.error('[useAjukanTA] fetch dosen error:', err);
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat daftar dosen.');
    } finally {
      setIsLoadingDosen(false);
    }
  }, []);

  useEffect(() => {
    fetchDosen();
  }, [fetchDosen]);

  /* ── Submit handler ──────────────────────────────────────── */
  const onSubmit = useCallback(
    async (payload: CreateTAPayload) => {
      setIsLoading(true);
      setError(null);
      try {
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
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { onSubmit, isLoading, isLoadingDosen, dosenList, error };
}
