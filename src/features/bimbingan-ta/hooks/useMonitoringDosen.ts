'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';

export type MonitoringJadwalStatus = 'Akan Datang' | 'Selesai';

export interface MonitoringCatatanItem {
  id: number;
  tanggal: string;
  topik: string;
  catatan: string;
  tugasSelanjutnya: string;
  penulis: string;
}

export interface MonitoringJadwalItem {
  id: number;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  lokasi: string;
  topik: string;
  status: MonitoringJadwalStatus;
}

export interface MonitoringMahasiswa {
  id: number;
  supervisorId: number;
  nama: string;
  nim: string;
  semester: string;
  progress: number;
  judulTA: string;
  catatan: MonitoringCatatanItem[];
  jadwal: MonitoringJadwalItem[];
}

export interface TambahCatatanPayload {
  topik: string;
  catatan: string;
  tugasSelanjutnya: string;
  startTime?: string;
  endTime?: string;
}

export interface AturJadwalPayload {
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  topik: string;
  lokasi: string;
}

export interface MonitoringToast {
  type: 'success' | 'error';
  message: string;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toLocalDateTimeString(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());
  const second = pad2(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function parseBackendDateTime(value: string): Date | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const localMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (localMatch) {
    const [, y, m, d, hh = '00', mm = '00', ss = '00'] = localMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateToDisplay(isoDate: string) {
  try {
    const parsed = parseBackendDateTime(isoDate);
    if (!parsed) return isoDate;

    return parsed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function isConsultationPast(consultationDate: string, endTime?: string): boolean {
  try {
    const now = new Date();
    const startDate = parseBackendDateTime(consultationDate);
    
    if (!startDate) return false;

    // Use endTime if available
    if (endTime && /^\d{2}:\d{2}/.test(endTime)) {
      const [hours, minutes] = endTime.split(':').map(Number);
      // Create date object from startDate but set hours/minutes from endTime
      const endDate = new Date(startDate);
      endDate.setHours(hours, minutes, 0, 0);
      return endDate < now;
    }

    // Fallback: If no endTime, add 1 hour buffer
    const implicitEndDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    return implicitEndDate < now;
  } catch {
    return false;
  }
}

function mapToMahasiswa(source: Awaited<ReturnType<typeof thesisIntegrationService.getLecturerMonitoringStudents>>): MonitoringMahasiswa[] {
  return source.map((item, index) => {
    const sortedConsultations = [...item.consultations].sort(
      (a, b) => (parseBackendDateTime(b.consultationDate)?.getTime() ?? 0) - (parseBackendDateTime(a.consultationDate)?.getTime() ?? 0),
    );

    const catatan = sortedConsultations.map((consultation) => ({
      id: consultation.id,
      tanggal: formatDateToDisplay(consultation.consultationDate),
      topik: consultation.subject,
      catatan: consultation.lecturerNotes || consultation.studentNotes || 'Belum ada catatan.',
      tugasSelanjutnya: consultation.studentNotes || 'Belum ada tugas selanjutnya.',
      penulis: 'Dosen',
    }));

    const jadwal = sortedConsultations.map((consultation) => {
      const start = consultation.startTime || '00:00';
      const end = consultation.endTime || '00:00';
      
      const isFinished = consultation.status === 'finished' || isConsultationPast(consultation.consultationDate, consultation.endTime);

      return {
        id: consultation.id,
        tanggal: formatDateToDisplay(consultation.consultationDate),
        waktuMulai: start,
        waktuSelesai: end,
        lokasi: consultation.location || 'Sesuai arahan dosen',
        topik: consultation.subject,
        status: isFinished ? 'Selesai' : 'Akan Datang',
      } as MonitoringJadwalItem;
    });

    return {
      id: item.studentId || index + 1,
      supervisorId: item.supervisorId,
      nama: item.studentName,
      nim: item.studentNim,
      semester: 'Bimbingan TA',
      progress: item.progress,
      judulTA: item.thesisTitle,
      catatan,
      jadwal,
    };
  });
}

export function useMonitoringDosen() {
  const [mahasiswaList, setMahasiswaList] = useState<MonitoringMahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [isCatatanModalOpen, setIsCatatanModalOpen] = useState<boolean>(false);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<MonitoringToast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMonitoringData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await thesisIntegrationService.getLecturerMonitoringStudents();
      const mapped = mapToMahasiswa(response);
      setMahasiswaList(mapped);
      if (!mapped.some((item) => item.id === selectedStudentId)) {
        setSelectedStudentId(mapped[0]?.id ?? 0);
      }
    } catch (err: any) {
      setMahasiswaList([]);
      setToast({
        type: 'error',
        message: err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal memuat data monitoring dosen.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  const filteredStudents = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return mahasiswaList;

    return mahasiswaList.filter((student) => {
      return student.nama.toLowerCase().includes(keyword) || student.nim.toLowerCase().includes(keyword);
    });
  }, [mahasiswaList, searchQuery]);

  const activeStudent = useMemo(() => {
    return mahasiswaList.find((student) => student.id === selectedStudentId) ?? null;
  }, [mahasiswaList, selectedStudentId]);

  useEffect(() => {
    if (mahasiswaList.length === 0) {
      setSelectedStudentId(0);
      return;
    }

    const isValidSelection = mahasiswaList.some((student) => student.id === selectedStudentId);
    if (!isValidSelection) {
      setSelectedStudentId(mahasiswaList[0].id);
    }
  }, [mahasiswaList, selectedStudentId]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((type: MonitoringToast['type'], message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  }, []);

  const handleTambahCatatan = useCallback(
    async (payload: TambahCatatanPayload) => {
      if (!activeStudent) {
        showToast('error', 'Mahasiswa belum dipilih.');
        return;
      }

      if (!activeStudent.supervisorId) {
        showToast('error', 'Data pembimbing mahasiswa belum lengkap. Silakan muat ulang halaman atau cek data bimbingan.');
        return;
      }

      try {
        const consultationDate = payload.startTime || toLocalDateTimeString(new Date());
        const endTimeNote = payload.endTime ? ` | Waktu Selesai: ${payload.endTime}` : '';

        await thesisIntegrationService.createConsultation(activeStudent.supervisorId, {
          consultation_date: consultationDate,
          subject: payload.topik,
          lecturer_notes: payload.catatan + endTimeNote,
          student_notes: payload.tugasSelanjutnya,
          status: 'on_going',
        });

        await fetchMonitoringData();
        setIsCatatanModalOpen(false);
        showToast('success', 'Catatan bimbingan berhasil ditambahkan.');
      } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal menyimpan catatan bimbingan.');
      }
    },
    [activeStudent, fetchMonitoringData, showToast],
  );

  const handleAturJadwal = useCallback(
    async (payload: AturJadwalPayload) => {
      if (!activeStudent) {
        showToast('error', 'Mahasiswa belum dipilih.');
        return;
      }

      if (!activeStudent.supervisorId) {
        showToast('error', 'Data pembimbing mahasiswa belum lengkap. Silakan muat ulang halaman atau cek data bimbingan.');
        return;
      }

      try {
        const consultationDate = `${payload.tanggal} ${payload.waktuMulai}:00`;

        await thesisIntegrationService.createConsultation(activeStudent.supervisorId, {
          consultation_date: consultationDate,
          subject: payload.topik,
          lecturer_notes: `Lokasi: ${payload.lokasi} | Waktu: ${payload.waktuMulai}-${payload.waktuSelesai}`,
          student_notes: '',
          status: 'on_going',
        });

        await fetchMonitoringData();
        setIsJadwalModalOpen(false);
        showToast('success', 'Jadwal bimbingan berhasil ditambahkan.');
      } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal menyimpan jadwal bimbingan.');
      }
    },
    [activeStudent, fetchMonitoringData, showToast],
  );

  const handleUpdateStatus = useCallback(
    async (consultationId: number, status: 'finished') => {
      try {
        await thesisIntegrationService.updateConsultationStatus(consultationId, status);
        await fetchMonitoringData();
        showToast('success', 'Status bimbingan berhasil diperbarui.');
      } catch (err: any) {
        showToast('error', err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal memperbarui status bimbingan.');
      }
    },
    [fetchMonitoringData, showToast],
  );

  return {
    mahasiswaList,
    filteredStudents,
    activeStudent,
    searchQuery,
    setSearchQuery,
    selectedStudentId,
    setSelectedStudentId,
    isCatatanModalOpen,
    setIsCatatanModalOpen,
    isJadwalModalOpen,
    setIsJadwalModalOpen,
    handleTambahCatatan,
    handleAturJadwal,
    handleUpdateStatus,
    toast,
    setToast,
    isLoading,
    refetch: fetchMonitoringData,
  };
}
