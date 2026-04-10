import { buildImageUrl } from '@/lib/utils';

export const STATUS_CONFIG = {
  proposing: {
    label: 'Menunggu Approval',
    bg: '#fef9ec',
    border: '#fde68a',
    text: '#b45309',
    dot: '#f59e0b',
  },
  on_progress: {
    label: 'Approved',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    dot: '#10b981',
  },
  revision: {
    label: 'Revisi',
    bg: '#fff7ed',
    border: '#fed7aa',
    text: '#9a3412',
    dot: '#f97316',
  },
  finished: {
    label: 'Selesai',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    dot: '#10b981',
  },
  on_going: {
    label: 'Berjalan',
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    dot: '#2563eb',
  },
  ditolak: {
    label: 'Ditolak',
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    dot: '#ef4444',
  },
  pending: {
    label: 'Menunggu Approval',
    bg: '#fef9ec',
    border: '#fde68a',
    text: '#b45309',
    dot: '#f59e0b',
  },
  accepted: {
    label: 'Approved',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#065f46',
    dot: '#10b981',
  },
  rejected: {
    label: 'Ditolak',
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
    dot: '#ef4444',
  },
};

export const AVATAR_COLORS = ['#015023', '#1e40af', '#7e22ce', '#b45309', '#991b1b'];

export function normalizeStatus(status) {
  if (!status) return 'proposing';
  if (status === 'rejected') return 'ditolak';
  return status;
}

export function getStatusMeta(status) {
  const key = normalizeStatus(status);
  return STATUS_CONFIG[key] || {
    label: status || '-',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    text: '#334155',
    dot: '#94a3b8',
  };
}

export function getInitials(name, fallback = 'AD') {
  if (!name || typeof name !== 'string') return fallback;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return initials || fallback;
}

export function getAvatarColor(name) {
  const safe = name || '';
  const index = (safe.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatDate(dateStr) {
  if (!dateStr) return '–';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '–';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '–';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '–';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatThesisId(id, createdAt) {
  if (!id) return 'TA-0000-000';

  const date = new Date(createdAt || Date.now());
  const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();

  return `TA-${year}-${String(id).padStart(3, '0')}`;
}

export function parseApiPayload(response) {
  if (!response) return null;

  const body = response.data ?? response;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }

  return body;
}

export function parsePaginatedPayload(response) {
  const payload = parseApiPayload(response);

  if (payload && Array.isArray(payload.data)) {
    return {
      current_page: toNumber(payload.current_page, 1),
      data: payload.data,
      per_page: toNumber(payload.per_page, payload.data.length || 1),
      total: toNumber(payload.total, payload.data.length || 0),
      last_page: toNumber(payload.last_page, 1),
    };
  }

  if (Array.isArray(payload)) {
    return {
      current_page: 1,
      data: payload,
      per_page: payload.length || 1,
      total: payload.length,
      last_page: 1,
    };
  }

  return {
    current_page: 1,
    data: [],
    per_page: 6,
    total: 0,
    last_page: 1,
  };
}

export function extractPrograms(programResponse) {
  const payload = parseApiPayload(programResponse);
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return source
    .map((program) => ({
      id_program: Number(program?.id_program || program?.id),
      name: program?.name || program?.program_name || `Program ${program?.id_program || program?.id || ''}`,
    }))
    .filter((program) => Number.isFinite(program.id_program));
}

export function getStudentNim(thesis) {
  return (
    thesis?.student?.nim ||
    thesis?.student?.username ||
    thesis?.student?.student_profile?.nim ||
    thesis?.student?.student_number ||
    '–'
  );
}

export function getStudentSemester(thesis) {
  return (
    thesis?.student?.semester ||
    thesis?.student?.student_profile?.semester ||
    thesis?.semester ||
    '–'
  );
}

export function getStudentIpk(thesis) {
  const candidate =
    thesis?.student?.ipk ??
    thesis?.student?.gpa ??
    thesis?.student?.student_profile?.ipk ??
    thesis?.student?.student_profile?.gpa ??
    thesis?.ipk ??
    null;

  const value = Number(candidate);
  if (!Number.isFinite(value)) return null;
  return value;
}

export function getIpkTone(ipk) {
  if (ipk === null) return 'text-[#6b7280]';
  if (ipk >= 3.5) return 'text-[#047857]';
  if (ipk < 3) return 'text-[#b91c1c]';
  return 'text-[#b45309]';
}

export function flattenConsultations(supervisors = []) {
  return (supervisors || []).flatMap((supervisor) => {
    const lecturerName = supervisor?.lecturer?.name || 'Dosen Pembimbing';

    return (supervisor?.consultations || []).map((consultation) => ({
      ...consultation,
      lecturer_name: lecturerName,
    }));
  });
}

export function getAttachmentUrl(path) {
  if (!path) return null;
  return buildImageUrl(path);
}

export function extractErrorMessage(error, fallbackMessage) {
  if (error?.response?.status) {
    console.warn('API error:', error.response.status);
  }

  return (
    error?.userMessage ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage ||
    'Terjadi kesalahan pada server.'
  );
}

export function isSameOrAfterDate(dateStr, filterDate) {
  if (!filterDate) return true;
  if (!dateStr) return false;

  const source = new Date(dateStr);
  const target = new Date(`${filterDate}T00:00:00`);

  if (Number.isNaN(source.getTime()) || Number.isNaN(target.getTime())) {
    return true;
  }

  return source >= target;
}

export function getCurrentYear() {
  return new Date().getFullYear();
}
