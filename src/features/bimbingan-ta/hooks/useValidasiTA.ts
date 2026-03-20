'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface ValidasiSubmission {
  id: number;
  thesisId: number;
  mahasiswa: string;
  nim: string;
  prodi: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  date: string;
  status: SubmissionStatus;
}

export interface ValidasiStats {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ValidationToast {
  type: 'success' | 'error' | 'info';
  message: string;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

const getFileName = (url: string | null) => {
  if (!url) return 'Proposal belum tersedia';
  return url.split('/').pop() || 'proposal.pdf';
};

const mapSubmissionStatus = (status: string): SubmissionStatus => {
  const lower = status.toLowerCase();
  if (lower === 'accepted' || lower === 'approved') return 'approved';
  if (lower === 'rejected' || lower === 'ditolak') return 'rejected';
  return 'pending';
};

export function useValidasiTA() {
  const [submissions, setSubmissions] = useState<ValidasiSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ValidationToast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await thesisIntegrationService.getLecturerRequests();
      setSubmissions(
        requests.map((item) => ({
          id: item.id,
          thesisId: item.thesisId,
          mahasiswa: item.studentName,
          nim: item.studentNim,
          prodi: item.studentProgram,
          title: item.title,
          description: item.description,
          fileName: getFileName(item.attachment),
          fileUrl: item.attachment ?? '',
          date: formatDate(item.createdAt),
          status: mapSubmissionStatus(item.status),
        })),
      );
    } catch (err: any) {
      showToast('error', err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal memuat pengajuan mahasiswa.');
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showToast = useCallback((type: ValidationToast['type'], message: string) => {
    setToast({ type, message });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    fetchRequests();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchRequests]);

  const stats = useMemo<ValidasiStats>(() => {
    const pending = submissions.filter((item) => item.status === 'pending').length;
    const approved = submissions.filter((item) => item.status === 'approved').length;
    const rejected = submissions.filter((item) => item.status === 'rejected').length;
    return { pending, approved, rejected };
  }, [submissions]);

  const pendingSubmissions = useMemo(
    () => submissions.filter((item) => item.status === 'pending'),
    [submissions],
  );

  const handleApprove = useCallback(
    async (id: number) => {
      try {
        await thesisIntegrationService.approveLecturerRequest(id);
        await fetchRequests();
        showToast('success', 'Pengajuan berhasil disetujui.');
      } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal menyetujui pengajuan.');
      }
    },
    [fetchRequests, showToast],
  );

  const handleReject = useCallback(
    async (id: number) => {
      try {
        await thesisIntegrationService.rejectLecturerRequest(id);
        await fetchRequests();
        showToast('success', 'Pengajuan berhasil ditolak.');
      } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal menolak pengajuan.');
      }
    },
    [fetchRequests, showToast],
  );

  const handleDownload = useCallback(
    (fileUrl: string) => {
      if (!fileUrl) {
        showToast('error', 'File proposal belum tersedia.');
        return;
      }
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      showToast('info', `Mengunduh file proposal: ${fileUrl.split('/').pop()}`);
    },
    [showToast],
  );

  return {
    stats,
    submissions,
    isLoading,
    pendingSubmissions,
    handleApprove,
    handleReject,
    handleDownload,
    toast,
    setToast,
    refetch: fetchRequests,
  };
}
