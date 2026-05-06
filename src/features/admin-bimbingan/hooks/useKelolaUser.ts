'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { studentTaService } from '@/services/studentTaService';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';

export type UserTab = 'mahasiswa' | 'dosen';

export interface Dosen {
  id: string;
  nama: string;
  nip: string;
  bidangKeahlian: string;
  jabatan: string;
  status: 'Aktif' | 'Tidak Aktif';
  kuotaTerisi: number;
  kuotaMaks: number;
}

export interface Mahasiswa {
  id: string;
  thesisId: number;
  nim: string;
  nama: string;
  programStudi: string;
  semester: number;
  ipk: number;
  status: 'Aktif' | 'Tidak Aktif' | 'Lulus';
  dosenId: string | null;
  dosenNama: string | null;
}

export interface UserStats {
  totalMahasiswa: number;
  sudahPunyaDosen: number;
  totalDosen: number;
  dosenAktif: number;
}

export const useKelolaUser = () => {
  const [activeTab, setActiveTab] = useState<UserTab>('mahasiswa');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Mahasiswa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'nama' | 'nim' | 'ipk'>('nama');

  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dosenRaw, requests] = await Promise.all([
        studentTaService.getLecturers(),
        thesisIntegrationService.getAdminRequests(),
      ]);

      const mappedDosen: Dosen[] = dosenRaw.map((item) => ({
        id: String(item.id_user_si),
        nama: item.staff_profile?.full_name || item.name || '-',
        nip: item.staff_profile?.employee_id_number || item.username || String(item.id_user_si),
        bidangKeahlian: '-',
        jabatan: item.staff_profile?.position || '-',
        status: 'Aktif',
        kuotaTerisi: requests.filter((req) => req.lecturerId === item.id_user_si && req.status === 'accepted').length,
        kuotaMaks: 10,
      }));

      const mahasiswaMap = new Map<string, Mahasiswa>();

      requests.forEach((req) => {
        const key = String(req.studentId || req.id);
        if (!mahasiswaMap.has(key)) {
          mahasiswaMap.set(key, {
            id: key,
            thesisId: req.thesisId,
            nim: req.studentNim || '-',
            nama: req.studentName || '-',
            programStudi: req.studentProgram || '-',
            semester: 8,
            ipk: 3.5,
            status: 'Aktif',
            dosenId: req.lecturerId ? String(req.lecturerId) : null,
            dosenNama: req.lecturerName && req.lecturerName !== '-' ? req.lecturerName : null,
          });
        }
      });

      setDosenList(mappedDosen);
      setMahasiswaList(Array.from(mahasiswaMap.values()));
    } catch (error) {
      console.error('[useKelolaUser] fetchData error:', error);
      setDosenList([]);
      setMahasiswaList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats: UserStats = useMemo(
    () => ({
      totalMahasiswa: mahasiswaList.length,
      sudahPunyaDosen: mahasiswaList.filter((m) => m.dosenId !== null).length,
      totalDosen: dosenList.length,
      dosenAktif: dosenList.filter((d) => d.status === 'Aktif').length,
    }),
    [mahasiswaList, dosenList],
  );

  const filteredMahasiswa = useMemo(() => {
    let data = mahasiswaList.filter(
      (m) =>
        m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.programStudi.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortBy === 'nama') {
      data = [...data].sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (sortBy === 'nim') {
      data = [...data].sort((a, b) => a.nim.localeCompare(b.nim));
    } else if (sortBy === 'ipk') {
      data = [...data].sort((a, b) => b.ipk - a.ipk);
    }

    return data;
  }, [mahasiswaList, searchTerm, sortBy]);

  const filteredDosen = useMemo(() => {
    return dosenList.filter(
      (d) =>
        d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.bidangKeahlian.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [dosenList, searchTerm]);

  const openAssignModal = useCallback((user: Mahasiswa) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
    }, 200);
  }, []);

  const handleAssignDosen = useCallback(
    async (userId: string, dosenId: string) => {
      const mahasiswa = mahasiswaList.find((m) => m.id === userId);
      if (!mahasiswa) return;

      setSuccessMessage(null);
      setErrorMessage(null);

      try {
        await thesisIntegrationService.assignLecturerByAdmin(mahasiswa.thesisId, Number(dosenId));
        const dosenTarget = dosenList.find((d) => d.id === dosenId);
        setSuccessMessage(`Dosen pembimbing ${dosenTarget?.nama || ''} berhasil di-assign ke ${mahasiswa.nama}.`);
        await fetchData();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Gagal meng-assign dosen pembimbing.';
        setErrorMessage(msg);
        throw err; // re-throw so AssignDosenModal knows it failed
      } finally {
        closeModal();
      }
    },
    [closeModal, fetchData, mahasiswaList, dosenList],
  );

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    selectedUser,
    isLoading,
    sortBy,
    setSortBy,
    stats,
    mahasiswaList,
    filteredMahasiswa,
    dosenList,
    filteredDosen,
    openAssignModal,
    closeModal,
    handleAssignDosen,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    refetch: fetchData,
  };
};
