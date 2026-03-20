'use client';

import { useEffect, useMemo, useState } from 'react';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';

export interface DokumenProposal {
  nama: string;
  ukuran: string;
  url: string;
}

export interface MonitoringDetailData {
  id_pengajuan: string;
  nama: string;
  nim: string;
  prodi: string;
  semester: string;
  email: string;
  ipk: string;
  status_approval: 'Menunggu Approval' | 'Approved' | 'Ditolak';
  judul: string;
  judul_inggris: string;
  deskripsi: string;
  tanggal_pengajuan: string;
  dokumen_proposal: DokumenProposal;
  progress_step: number;
  catatan_bimbingan: any[];
  dosen_pembimbing: any | null;
  jadwal_bimbingan: any[];
}

const fallbackData: MonitoringDetailData = {
  id_pengajuan: '-',
  nama: '-',
  nim: '-',
  prodi: '-',
  semester: '-',
  email: '-',
  ipk: '-',
  status_approval: 'Menunggu Approval',
  judul: '-',
  judul_inggris: '-',
  deskripsi: '-',
  tanggal_pengajuan: '-',
  dokumen_proposal: {
    nama: 'Proposal tidak tersedia',
    ukuran: '-',
    url: '#',
  },
  progress_step: 1,
  catatan_bimbingan: [],
  dosen_pembimbing: null,
  jadwal_bimbingan: [],
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function mapStatus(status: string): MonitoringDetailData['status_approval'] {
  const lower = status.toLowerCase();
  if (lower === 'accepted' || lower === 'approved') return 'Approved';
  if (lower === 'rejected' || lower === 'ditolak') return 'Ditolak';
  return 'Menunggu Approval';
}

export const useMonitoringDetail = (id: string) => {
  const [data, setData] = useState<MonitoringDetailData>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const requests = await thesisIntegrationService.getAdminRequests();
        const selected = requests.find((item) => String(item.id) === String(id));

        if (!selected) {
          setData(fallbackData);
          return;
        }

        setData({
          id_pengajuan: `TA-${selected.thesisId || selected.id}`,
          nama: selected.studentName,
          nim: selected.studentNim,
          prodi: selected.studentProgram,
          semester: '8',
          email: '-',
          ipk: '-',
          status_approval: mapStatus(selected.status),
          judul: selected.title,
          judul_inggris: selected.title,
          deskripsi: selected.description || '-',
          tanggal_pengajuan: formatDate(selected.createdAt),
          dokumen_proposal: {
            nama: selected.attachment ? selected.attachment.split('/').pop() || 'proposal.pdf' : 'Proposal belum tersedia',
            ukuran: '-',
            url: selected.attachment || '#',
          },
          progress_step: selected.status === 'accepted' ? 3 : selected.status === 'rejected' ? 2 : 1,
          catatan_bimbingan: [],
          dosen_pembimbing:
            selected.lecturerName && selected.lecturerName !== '-'
              ? { nama: selected.lecturerName }
              : null,
          jadwal_bimbingan: [],
        });
      } catch {
        setData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [id]);

  return useMemo(
    () => ({ data, isLoading }),
    [data, isLoading],
  );
};
