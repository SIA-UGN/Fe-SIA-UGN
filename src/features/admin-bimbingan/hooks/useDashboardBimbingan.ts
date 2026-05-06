'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';

interface DashboardStats {
  hero: {
    total: number;
    approved: number;
    menunggu: number;
    ditolak: number;
  };
  grids: {
    pengajuanBaru: number;
    totalJudul: number;
    dosenAktif: number;
    mhsMonitoring: number;
  };
}

interface RecentSubmission {
  id: string;
  name: string;
  nim: string;
  date: string;
  title: string;
  pembimbing: string | null;
  status: 'Menunggu Approval' | 'Approved' | 'Ditolak';
}

const mapRecentStatus = (value: string): RecentSubmission['status'] => {
  const lower = value.toLowerCase();
  if (lower === 'accepted' || lower === 'approved') return 'Approved';
  if (lower === 'rejected' || lower === 'ditolak') return 'Ditolak';
  return 'Menunggu Approval';
};

export interface AdminBimbinganState {
  stats: DashboardStats | null;
  recentSubmissions: RecentSubmission[];
  isLoading: boolean;
  errorMessage: string | null;
  isModalOpen: boolean;
  selectedItem: RecentSubmission | null;
}

export const useDashboardBimbingan = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecentSubmission | null>(null);
  const hasFetchedRef = useRef(false);

  // Fetch data on component mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const requests = await thesisIntegrationService.getAdminRequests();

        // Empty data is OK - just show empty state, not an error
        const mappedSubmissions: RecentSubmission[] = requests
          .map((item) => ({
            id: String(item.id),
            name: item.studentName,
            nim: item.studentNim,
            date: item.createdAt,
            title: item.title,
            pembimbing: item.lecturerName && item.lecturerName !== '-' ? item.lecturerName : null,
            status: mapRecentStatus(item.status),
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        const total = requests.length;
        const approved = requests.filter((item) => item.status === 'accepted').length;
        const menunggu = requests.filter((item) => item.status === 'pending').length;
        const ditolak = requests.filter((item) => item.status === 'rejected').length;
        const dosenAktif = new Set(
          requests
            .filter((item) => item.lecturerId > 0)
            .map((item) => item.lecturerId),
        ).size;

        setStats({
          hero: { total, approved, menunggu, ditolak },
          grids: {
            pengajuanBaru: menunggu,
            totalJudul: total,
            dosenAktif,
            mhsMonitoring: approved,
          },
        });
        setRecentSubmissions(mappedSubmissions);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        // Only set error message for actual errors, not for 404 (which returns empty)
        const backendMessage = error?.response?.data?.message;
        const networkMessage = error?.message;
        setErrorMessage(backendMessage || networkMessage || 'Gagal memuat data dashboard bimbingan.');

        setStats({
          hero: { total: 0, approved: 0, menunggu: 0, ditolak: 0 },
          grids: { pengajuanBaru: 0, totalJudul: 0, dosenAktif: 0, mhsMonitoring: 0 },
        });
        setRecentSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle modal open with item selection
  const handleOpenModal = useCallback((item: RecentSubmission) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Optional: clear selectedItem after modal closes
    setTimeout(() => {
      setSelectedItem(null);
    }, 200);
  }, []);

  return {
    stats,
    recentSubmissions,
    isLoading,
    errorMessage,
    isModalOpen,
    selectedItem,
    handleOpenModal,
    handleCloseModal,
  };
};
