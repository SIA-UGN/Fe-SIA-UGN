import Cookies from 'js-cookie';
import { buildImageUrl } from '@/lib/utils';
import type {
  ConsultationStatus,
  StudentThesisStatus,
  ThesisNotificationTarget,
  ThesisRequestStatus,
  ThesisTopicStatus,
} from './types';

type StatusTone = 'amber' | 'green' | 'red' | 'slate' | 'blue';

export const studentStatusLabelMap: Record<StudentThesisStatus, string> = {
  proposing: 'Pengajuan',
  on_progress: 'Berjalan',
  revision: 'Revisi',
  finished: 'Selesai',
};

export const topicStatusLabelMap: Record<ThesisTopicStatus, string> = {
  draft: 'Draft',
  available: 'Tersedia',
  taken: 'Penuh',
  archived: 'Arsip',
};

export const requestStatusLabelMap: Record<ThesisRequestStatus, string> = {
  pending: 'Menunggu',
  accepted: 'Disetujui',
  rejected: 'Ditolak',
};

export const consultationStatusLabelMap: Record<ConsultationStatus, string> = {
  on_going: 'Berjalan',
  finished: 'Selesai',
};

export const statusToneMap: Record<string, StatusTone> = {
  proposing: 'amber',
  on_progress: 'blue',
  revision: 'amber',
  finished: 'green',
  draft: 'slate',
  available: 'green',
  taken: 'amber',
  archived: 'slate',
  pending: 'amber',
  accepted: 'green',
  rejected: 'red',
  on_going: 'blue',
};

export function getStatusLabel(status: string) {
  return (
    studentStatusLabelMap[status as StudentThesisStatus] ||
    topicStatusLabelMap[status as ThesisTopicStatus] ||
    requestStatusLabelMap[status as ThesisRequestStatus] ||
    consultationStatusLabelMap[status as ConsultationStatus] ||
    status
  );
}

export function getStatusTone(status: string): StatusTone {
  return statusToneMap[status] || 'slate';
}

export function buildThesisAssetUrl(path?: string | null) {
  return buildImageUrl(path || '');
}

export function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value?: string | null) {
  if (!value) return '-';
  return value.slice(0, 5);
}

export function getThesisHomePath(role?: string | null) {
  if (role === 'dosen') return '/bimbingan-ta/dosen/topik';
  if (role === 'admin' || role === 'manager') return '/adminpage/thesis';
  return '/bimbingan-ta/mahasiswa';
}

export function getCurrentRole() {
  return Cookies.get('roles') || null;
}

export function countActiveRequests(statuses: Array<string | undefined | null>) {
  return statuses.filter((status) => status === 'pending' || status === 'accepted').length;
}

export function sortByNewest<T extends { updated_at?: string; created_at?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aValue = new Date(a.updated_at || a.created_at || 0).getTime();
    const bValue = new Date(b.updated_at || b.created_at || 0).getTime();
    return bValue - aValue;
  });
}

export function getReadableApiMessage(message?: string | null) {
  return message || 'Terjadi kesalahan. Silakan coba lagi.';
}

export function isThesisNotification(notification: {
  metadata?: Record<string, any> | null;
  id_thesis_lecturer?: number | null;
}) {
  const metadata = notification.metadata || {};

  if (notification.id_thesis_lecturer || metadata.id_thesis_lecturer || metadata.thesis_request_id) {
    return true;
  }

  const thesisMetadataKeys = [
    'id_student_thesis',
    'id_supervisor',
    'id_consultation',
    'thesis_status',
    'consultation_status',
    'thesis_event',
    'thesis_title',
    'consultation_date',
    'supervisor_name',
  ];

  return thesisMetadataKeys.some((key) => metadata[key] !== undefined && metadata[key] !== null);
}

export function getThesisNotificationTarget(notification: {
  metadata?: Record<string, any> | null;
  id_thesis_lecturer?: number | null;
}): ThesisNotificationTarget | null {
  if (!isThesisNotification(notification)) {
    return null;
  }

  const role = getCurrentRole();
  const metadata = notification.metadata || {};
  const requestId =
    notification.id_thesis_lecturer ||
    metadata.id_thesis_lecturer ||
    metadata.thesis_request_id ||
    null;

  if (requestId) {
    if (role === 'dosen') {
      return {
        href: `/bimbingan-ta/dosen/permintaan/${requestId}`,
        label: 'Buka permintaan bimbingan',
      };
    }

    if (role === 'admin' || role === 'manager') {
      return {
        href: '/adminpage/thesis/students',
        label: 'Buka daftar pengajuan TA',
      };
    }

    return {
      href: '/bimbingan-ta/mahasiswa/pengajuan',
      label: 'Buka status pengajuan TA',
    };
  }

  if (role === 'dosen') {
    return {
      href: '/bimbingan-ta/dosen/bimbingan',
      label: 'Buka monitoring bimbingan',
    };
  }

  if (role === 'admin' || role === 'manager') {
    return {
      href: '/adminpage/thesis/consultations',
      label: 'Buka daftar konsultasi TA',
    };
  }

  return {
    href: '/bimbingan-ta/mahasiswa/monitoring',
    label: 'Buka monitoring TA',
  };
}
