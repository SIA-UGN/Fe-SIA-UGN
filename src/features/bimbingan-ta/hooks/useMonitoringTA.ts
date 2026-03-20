'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRiwayatTA } from '@/features/bimbingan-ta/hooks/useRiwayatTA';

export interface DosenInfo {
  name: string;
  judulTA: string;
  email: string;
}

export interface MonitoringOption {
  id: string;
  label: string;
  lecturerId: number;
  lecturerName: string;
  lecturerEmail: string;
  judulTA: string;
}

export type JadwalStatus = 'Akan Datang' | 'Selesai';

export interface JadwalBimbinganItem {
  id: number;
  tanggal: string;
  waktu: string;
  tempat: string;
  topik: string;
  status: JadwalStatus;
}

export interface CatatanBimbinganItem {
  id: number;
  tanggal: string;
  judul: string;
  deskripsi: string;
  tugas_selanjutnya: string;
  penulis: string;
}

function formatTanggal(value: string) {
  try {
    const parsed = parseBackendDateTime(value);
    if (!parsed) return value;

    return parsed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatWaktu(value: string) {
  try {
    const parsed = parseBackendDateTime(value);
    if (!parsed) return '-';

    return parsed.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
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

function parseConsultationDetails(item: any) {
  const lecturerNotes = String(item.lecturer_notes || item.lecturer_note || item.catatan || '');
  let location = item.location || item.place || item.lokasi;
  let startTime = item.start_time;
  let endTime = item.end_time;

  // 1. Fallback: Parse location from notes if missing
  if (!location) {
    const locMatch = lecturerNotes.match(/Lokasi:\s*([^|]+)/i);
    if (locMatch) {
      location = locMatch[1].trim();
    }
  }

  // 2. Fallback: Parse times from notes if missing
  if (!startTime || !endTime) {
    const timeMatch = lecturerNotes.match(/Waktu:\s*([\d:.]+)\s*-\s*([\d:.]+)/i);
    if (timeMatch) {
      if (!startTime) startTime = timeMatch[1].trim();
      if (!endTime) endTime = timeMatch[2].trim();
    }
  }

  // 3. Fallback: Parse startTime from consultation_date
  if (!startTime && item.consultation_date) {
    const dateObj = parseBackendDateTime(item.consultation_date);
    if (dateObj) {
      startTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
    }
  }

  // 4. Fallback: Calculate endTime
  if (startTime && !endTime) {
    const timeParts = startTime.split(/[:.]/).map(Number);
    if (timeParts.length >= 2 && !Number.isNaN(timeParts[0])) {
      const endH = (timeParts[0] + 1) % 24;
      const endM = timeParts[1];
      endTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
    }
  }

  return { location, startTime, endTime };
}

function isConsultationPast(consultationDate: string, endTime?: string): boolean {
  try {
    const now = new Date();
    const startDate = parseBackendDateTime(consultationDate);
    
    if (!startDate) return false;

    // Use endTime if available
    if (endTime && /^\d{2}:\d{2}/.test(endTime)) {
      const [hours, minutes] = endTime.split(':').map(Number);
      const endDate = new Date(startDate);
      endDate.setHours(hours, minutes, 0, 0);
      return endDate < now;
    }

    // Fallback +1h buffer
    const implicitEndDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    return implicitEndDate < now;
  } catch {
    return false;
  }
}

export function useMonitoringTA() {
  const { thesis, isLoading, error, refetch } = useRiwayatTA();
  const [selectedMonitoringId, setSelectedMonitoringId] = useState('');

  const monitoringOptions = useMemo<MonitoringOption[]>(() => {
    if (!thesis) return [];

    const supervisorOptions =
      thesis.supervisors?.map((supervisor, index) => ({
        id: `supervisor-${supervisor.id_supervisor}`,
        label: `Bimbingan ${index + 1} - ${supervisor.lecturer.name}`,
        lecturerId: supervisor.lecturer.id_user_si,
        lecturerName: supervisor.lecturer.name,
        lecturerEmail: supervisor.lecturer.email ?? '-',
        judulTA: thesis.title_ind,
      })) ?? [];

    if (supervisorOptions.length > 0) return supervisorOptions;

    return (
      thesis.thesis_lecturers
        ?.filter((request) => request.status === 'accepted')
        .map((request, index) => ({
          id: `request-${request.id_thesis_lecturer}`,
          label: `Bimbingan ${index + 1} - ${request.lecturer.name}`,
          lecturerId: request.lecturer.id_user_si,
          lecturerName: request.lecturer.name,
          lecturerEmail: request.lecturer.email ?? '-',
          judulTA: thesis.title_ind,
        })) ?? []
    );
  }, [thesis]);

  useEffect(() => {
    if (monitoringOptions.length === 0) {
      setSelectedMonitoringId('');
      return;
    }

    const hasValidSelection = monitoringOptions.some((option) => option.id === selectedMonitoringId);
    if (!hasValidSelection) {
      setSelectedMonitoringId(monitoringOptions[0].id);
    }
  }, [monitoringOptions, selectedMonitoringId]);

  const selectedMonitoring = useMemo(
    () => monitoringOptions.find((option) => option.id === selectedMonitoringId) ?? null,
    [monitoringOptions, selectedMonitoringId],
  );

  const selectedSupervisor = useMemo(() => {
    if (!thesis || !selectedMonitoringId.startsWith('supervisor-')) return null;
    const id = Number(selectedMonitoringId.replace('supervisor-', ''));
    return thesis.supervisors?.find((item) => item.id_supervisor === id) ?? null;
  }, [thesis, selectedMonitoringId]);

  const dosenInfo = useMemo<DosenInfo | null>(() => {
    if (!selectedMonitoring) return null;

    return {
      name: selectedMonitoring.lecturerName,
      judulTA: selectedMonitoring.judulTA,
      email: selectedMonitoring.lecturerEmail,
    };
  }, [selectedMonitoring]);

  const jadwalBimbingan = useMemo<JadwalBimbinganItem[]>(() => {
    const list = selectedSupervisor?.consultations ?? [];

    return list
      .map((item) => {
        const dateObj = parseBackendDateTime(item.consultation_date);
        const { startTime, endTime, location } = parseConsultationDetails(item);
        const isDone = item.status === 'finished' || isConsultationPast(item.consultation_date, endTime);
        
        const waktu = (!startTime && !endTime)
          ? '-'
          : `${startTime || '00:00'} - ${endTime || '00:00'}`;

        return {
          id: item.id_consultation,
          tanggal: formatTanggal(item.consultation_date),
          waktu,
          tempat: location || 'Sesuai arahan dosen',
          topik: item.subject,
          status: isDone ? 'Selesai' : 'Akan Datang',
          _sortTime: dateObj?.getTime() ?? 0,
        } as JadwalBimbinganItem & { _sortTime: number };
      })
      .sort((a, b) => {
        return b._sortTime - a._sortTime;
      })
      .map(({ _sortTime, ...item }) => item);
  }, [selectedSupervisor]);

  const catatanBimbingan = useMemo<CatatanBimbinganItem[]>(() => {
    const list = selectedSupervisor?.consultations ?? [];

    return list
      .map((item) => ({
        id: item.id_consultation,
        tanggal: formatTanggal(item.consultation_date),
        judul: item.subject,
        deskripsi: item.lecturer_notes || item.student_notes || 'Belum ada catatan.',
        tugas_selanjutnya: item.student_notes || 'Belum ada tugas lanjutan.',
        penulis: 'Dosen',
      }))
      .sort((a, b) => b.id - a.id);
  }, [selectedSupervisor]);

  return {
    thesis,
    monitoringOptions,
    selectedMonitoringId,
    setSelectedMonitoringId,
    selectedMonitoring,
    hasConfirmedMentorships: monitoringOptions.length > 0,
    dosenInfo,
    jadwalBimbingan,
    catatanBimbingan,
    isLoading,
    error,
    refetch,
  };
}
