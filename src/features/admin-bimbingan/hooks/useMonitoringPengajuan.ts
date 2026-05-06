'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';

export interface Pembimbing {
  id: string;
  nama: string;
}

export interface Mahasiswa {
  nama: string;
  nim: string;
  prodi: string;
}

export interface PengajuanTA {
  id: string;
  idPengajuan: string;
  thesisId: number;
  mahasiswa: Mahasiswa;
  judul: string;
  tanggal: string;
  status: 'Menunggu Approval' | 'Approved' | 'Ditolak';
  pembimbing: Pembimbing | null;
}

export interface HeroStats {
  total: number;
  menunggu: number;
  approved: number;
  ditolak: number;
}

export interface GridStats {
  menungguApproval: number;
  approved: number;
  sudahAdaDosen: number;
  belumAdaDosen: number;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return value;
  }
};

const mapStatus = (value: string): PengajuanTA['status'] => {
  const lower = value.toLowerCase();
  if (lower === 'accepted' || lower === 'approved') return 'Approved';
  if (lower === 'rejected' || lower === 'ditolak') return 'Ditolak';
  return 'Menunggu Approval';
};

export const useMonitoringPengajuan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterDosen, setFilterDosen] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'terbaru' | 'nama' | 'status'>('terbaru');
  const [error, setError] = useState<string | null>(null);
  const [pengajuanList, setPengajuanList] = useState<PengajuanTA[]>([]);

  const fetchPengajuan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await thesisIntegrationService.getAdminRequests();
      const mapped: PengajuanTA[] = response.map((item) => ({
        id: String(item.id),
        idPengajuan: `TA-${item.thesisId || item.id}`,
        thesisId: item.thesisId,
        mahasiswa: {
          nama: item.studentName,
          nim: item.studentNim,
          prodi: item.studentProgram,
        },
        judul: item.title,
        tanggal: formatDate(item.createdAt),
        status: mapStatus(item.status),
        pembimbing: item.lecturerId
          ? {
              id: String(item.lecturerId),
              nama: item.lecturerName,
            }
          : null,
      }));
      setPengajuanList(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal memuat data monitoring pengajuan TA.');
      setPengajuanList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPengajuan();
  }, [fetchPengajuan]);

  const heroStats: HeroStats = useMemo(() => {
    const menunggu = pengajuanList.filter((item) => item.status === 'Menunggu Approval').length;
    const approved = pengajuanList.filter((item) => item.status === 'Approved').length;
    const ditolak = pengajuanList.filter((item) => item.status === 'Ditolak').length;

    return {
      total: pengajuanList.length,
      menunggu,
      approved,
      ditolak,
    };
  }, [pengajuanList]);

  const gridStats: GridStats = useMemo(() => {
    const menungguApproval = pengajuanList.filter((item) => item.status === 'Menunggu Approval').length;
    const approved = pengajuanList.filter((item) => item.status === 'Approved').length;
    const sudahAdaDosen = pengajuanList.filter((item) => item.pembimbing !== null).length;

    return {
      menungguApproval,
      approved,
      sudahAdaDosen,
      belumAdaDosen: Math.max(0, pengajuanList.length - sudahAdaDosen),
    };
  }, [pengajuanList]);

  const filteredPengajuan = useMemo(() => {
    let data = pengajuanList.filter((item) => {
      const matchesSearch =
        item.mahasiswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mahasiswa.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idPengajuan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || item.status === filterStatus;
      const matchesProdi = !filterProdi || item.mahasiswa.prodi === filterProdi;
      const matchesDate = !dateRange || item.tanggal === dateRange;
      const matchesDosen =
        !filterDosen ||
        (filterDosen === 'ada' && item.pembimbing !== null) ||
        (filterDosen === 'tidak' && item.pembimbing === null);

      return matchesSearch && matchesStatus && matchesProdi && matchesDosen && matchesDate;
    });

    if (sortBy === 'nama') {
      data = [...data].sort((a, b) => a.mahasiswa.nama.localeCompare(b.mahasiswa.nama));
    } else if (sortBy === 'status') {
      const statusOrder = { 'Menunggu Approval': 1, Approved: 2, Ditolak: 3 };
      data = [...data].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    } else {
      data = [...data].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    }

    return data;
  }, [pengajuanList, searchTerm, filterStatus, filterProdi, filterDosen, dateRange, sortBy]);

  const handleDetailClick = useCallback((id: string) => {
    window.location.href = `/admin/bimbingan/monitoring/${id}`;
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterProdi,
    setFilterProdi,
    filterDosen,
    setFilterDosen,
    dateRange,
    setDateRange,
    isLoading,
    sortBy,
    setSortBy,
    pengajuanList,
    filteredPengajuan,
    heroStats,
    gridStats,
    handleDetailClick,
    error,
    refetch: fetchPengajuan,
  };
};
