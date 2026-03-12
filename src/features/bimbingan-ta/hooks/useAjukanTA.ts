'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { taService, type Dosen, type CreateTAPayload } from '@/services/taService';

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
      const list = await taService.getDosenList();
      setDosenList(list);
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
        await taService.create(payload);
        // Navigate back to list page on success
        router.push('/bimbingan/pengajuan');
      } catch (err: any) {
        console.error('[useAjukanTA] submit error:', err);
        setError(err?.userMessage ?? err?.message ?? 'Gagal mengajukan tugas akhir.');
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { onSubmit, isLoading, isLoadingDosen, dosenList, error };
}
