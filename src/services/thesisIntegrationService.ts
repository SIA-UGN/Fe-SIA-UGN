import axiosInstance from '@/lib/axios';
import type { TAStudentStatus } from '@/services/taService';
import { studentTaService } from '@/services/studentTaService';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface IntegratedTopic {
  id: number;
  title: string;
  category: string;
  lecturerId: number;
  lecturerName: string;
  lecturerEmail: string;
  description: string;
  quotaTotal: number;
  quotaFilled: number;
  status: string;
  createdAt: string;
}

export interface IntegratedRequest {
  id: number;
  thesisId: number;
  thesisStatus: TAStudentStatus | string;
  studentId: number;
  studentName: string;
  studentNim: string;
  studentProgram: string;
  title: string;
  description: string;
  attachment: string | null;
  createdAt: string;
  status: RequestStatus;
  studentNote: string;
  rejectionNote: string;
  lecturerId: number;
  lecturerName: string;
}

export interface IntegratedConsultation {
  id: number;
  supervisorId: number;
  consultationDate: string;
  subject: string;
  studentNotes: string;
  lecturerNotes: string;
  status: 'pending' | 'on_going' | 'finished' | 'rejected';
  startTime?: string;
  endTime?: string;
  location?: string;
}

export interface IntegratedMonitoringStudent {
  supervisorId: number;
  studentId: number;
  studentName: string;
  studentNim: string;
  studentProgram: string;
  thesisTitle: string;
  thesisStatus: TAStudentStatus | string;
  progress: number;
  consultations: IntegratedConsultation[];
  lecturerId: number;
  lecturerName: string;
}


function asArray<T = any>(input: any): T[] {
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.data?.items)) return input.data.items;
  if (Array.isArray(input?.items)) return input.items;
  if (Array.isArray(input)) return input;
  return [];
}

function normalizeApiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const baseURL = String(axiosInstance.defaults.baseURL ?? '').toLowerCase();
  const baseHasApiSuffix = /\/api\/?$/.test(baseURL);

  if (baseHasApiSuffix && normalized.startsWith('/api/')) {
    return normalized.slice(4) || '/';
  }

  if (!baseHasApiSuffix && !normalized.startsWith('/api/')) {
    return `/api${normalized}`;
  }

  return normalized;
}

async function getWithFallback<T = any>(paths: string[]): Promise<T> {
  let lastError: any;
  for (const path of paths) {
    try {
      const { data } = await axiosInstance.get(normalizeApiPath(path));
      return data as T;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function patchWithFallback(paths: string[], body?: any): Promise<any> {
  let lastError: any;
  for (const path of paths) {
    try {
      const { data } = await axiosInstance.patch(normalizeApiPath(path), body ?? {});
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function putWithFallback(paths: string[], body?: any): Promise<any> {
  let lastError: any;
  for (const path of paths) {
    try {
      const { data } = await axiosInstance.put(normalizeApiPath(path), body ?? {});
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function postWithFallback(paths: string[], body?: any, config?: any): Promise<any> {
  let lastError: any;
  for (const path of paths) {
    try {
      const { data } = await axiosInstance.post(normalizeApiPath(path), body ?? {}, config);
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function postWithPayloadFallback(
  paths: string[],
  payloads: Array<{ body: any; config?: any }>,
): Promise<any> {
  let lastError: any;

  for (const payload of payloads) {
    for (const path of paths) {
      try {
        const { data } = await axiosInstance.post(
          normalizeApiPath(path),
          payload.body ?? {},
          payload.config,
        );
        return data;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError;
}

function normalizeRequestStatus(value: unknown): RequestStatus {
  const status = String(value ?? '').toLowerCase();
  if (status === 'accepted' || status === 'approved') return 'accepted';
  if (status === 'rejected' || status === 'declined') return 'rejected';
  return 'pending';
}

function getStudentName(raw: any): string {
  return (
    raw?.student?.name ??
    raw?.student?.full_name ??
    raw?.student?.student_profile?.full_name ??
    raw?.mahasiswa?.nama ??
    raw?.name ??
    '-'
  );
}

function getStudentNim(raw: any): string {
  return (
    raw?.student?.username ??
    raw?.student?.student_profile?.student_id_number ??
    raw?.student?.nim ??
    raw?.mahasiswa?.nim ??
    '-'
  );
}

function getStudentProgram(raw: any): string {
  return (
    raw?.program?.name ??
    raw?.student?.program?.name ??
    raw?.student?.study_program?.name ??
    raw?.mahasiswa?.prodi ??
    '-'
  );
}

function normalizeRequest(raw: any): IntegratedRequest {
  const lecturer = raw?.lecturer ?? raw?.dosen ?? {};
  const thesis = raw?.student_thesis ?? raw?.thesis ?? raw;

  return {
    id: Number(raw?.id_thesis_lecturer ?? raw?.id ?? 0),
    thesisId: Number(raw?.id_student_thesis ?? thesis?.id_student_thesis ?? thesis?.id ?? 0),
    thesisStatus: thesis?.status ?? 'proposing',
    studentId: Number(thesis?.id_student ?? raw?.student?.id_user_si ?? raw?.student_id ?? 0),
    studentName: getStudentName(thesis),
    studentNim: getStudentNim(thesis),
    studentProgram: getStudentProgram(thesis),
    title: String(thesis?.title_ind ?? thesis?.title ?? '-'),
    description: String(thesis?.description ?? ''),
    attachment: thesis?.attachment_proposal ?? null,
    createdAt: String(raw?.created_at ?? thesis?.created_at ?? new Date().toISOString()),
    status: normalizeRequestStatus(raw?.status),
    studentNote: String(raw?.student_note ?? ''),
    rejectionNote: String(raw?.rejection_note ?? ''),
    lecturerId: Number(lecturer?.id_user_si ?? raw?.id_lecturer ?? 0),
    lecturerName: String(lecturer?.name ?? lecturer?.full_name ?? '-'),
  };
}

function normalizeConsultation(raw: any): IntegratedConsultation {
  const lecturerNotes = String(raw?.lecturer_notes ?? raw?.catatan ?? '');
  let location = raw?.location ?? raw?.place ?? raw?.lokasi;
  let startTime = raw?.start_time;
  let endTime = raw?.end_time;

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
      if (!startTime) startTime = timeMatch[1].trim(); // e.g. "10:00"
      if (!endTime) endTime = timeMatch[2].trim();     // e.g. "11:00"
    }
  }

  // 3. Jika start_time kosong, ambil dari consultation_date dulu agar waktu tetap (tidak berubah-ubah)
  if (!startTime) {
    const persistedDate = raw?.consultation_date ?? raw?.date;
    if (persistedDate) {
      const dateObj = new Date(String(persistedDate).replace(' ', 'T'));
      if (!Number.isNaN(dateObj.getTime())) {
        startTime = dateObj
          .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
          .replace('.', ':');
      }
    }
  }

  // 3b. Fallback terakhir: jika memang tidak ada tanggal sama sekali, pakai waktu saat ini (WIB)
  if (!startTime) {
    startTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }

  // 4. Fallback: If startTime exists but is HH:mm, and endTime missing -> endTime = startTime + 1h
  if (startTime && !endTime) {
    // Check if startTime is just HH:mm or HH.mm
    const timeParts = startTime.split(/[:.]/).map(Number);
    if (timeParts.length >= 2 && !Number.isNaN(timeParts[0])) {
      const endH = (timeParts[0] + 1) % 24;
      const endM = timeParts[1];
      endTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
    }
  }

  // 5. Fallback consultation date: waktu saat ini (WIB) jika backend tidak kirim tanggal
  let defaultDate = raw?.consultation_date ?? raw?.date;
  if (!defaultDate) {
    defaultDate = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date()).replace(' ', 'T');
  }

  return {
    id: Number(raw?.id_consultation ?? raw?.id ?? 0),
    supervisorId: Number(raw?.id_supervisor ?? raw?.supervisor_id ?? 0),
    consultationDate: String(defaultDate).replace(' ', 'T'),
    subject: String(raw?.subject ?? raw?.topik ?? '-'),
    studentNotes: String(raw?.student_notes ?? ''),
    lecturerNotes,
    status: (raw?.status ?? 'pending') as IntegratedConsultation['status'],
    startTime,
    endTime,
    location: location || 'Sesuai arahan dosen',
  };
}

function extractConsultationList(raw: any, thesis: any, supervisorId: number): any[] {
  const fromThesis = asArray<any>(thesis?.consultations ?? thesis?.consultation_histories ?? []);
  const fromRoot = asArray<any>(raw?.consultations ?? raw?.consultation_histories ?? []);
  const fromSupervisorNode = asArray<any>(
    raw?.supervisor?.consultations ??
      raw?.supervisor?.consultation_histories ??
      raw?.supervision?.consultations ??
      raw?.supervision?.consultation_histories ??
      [],
  );

  const supervisors = asArray<any>(thesis?.supervisors ?? raw?.supervisors ?? []);
  const targetSupervisor = supervisors.find((item) => {
    const currentSupervisorId = toPositiveNumber(item?.id_supervisor ?? item?.supervisor?.id_supervisor);
    if (supervisorId > 0 && currentSupervisorId === supervisorId) return true;

    const lecturerIdFromRaw = toPositiveNumber(raw?.id_lecturer ?? raw?.lecturer?.id_user_si);
    const lecturerIdFromSupervisor = toPositiveNumber(item?.id_lecturer ?? item?.lecturer?.id_user_si);
    return lecturerIdFromRaw > 0 && lecturerIdFromSupervisor === lecturerIdFromRaw;
  });

  const fromMatchedSupervisor = asArray<any>(
    targetSupervisor?.consultations ?? targetSupervisor?.consultation_histories ?? [],
  );

  const merged = [
    ...fromThesis,
    ...fromRoot,
    ...fromSupervisorNode,
    ...fromMatchedSupervisor,
  ];

  const seen = new Set<string>();
  return merged.filter((item) => {
    const id = String(item?.id_consultation ?? item?.id ?? '');
    const key = `${id}|${String(item?.consultation_date ?? item?.date ?? '')}|${String(item?.subject ?? '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getConsultationsBySupervisor(supervisorId: number): Promise<any[]> {
  if (supervisorId <= 0) return [];

  try {
    const response = await getWithFallback<any>([
      `/api/lecturer/thesis/consultations?id_supervisor=${supervisorId}`,
    ]);

    return asArray<any>(response);
  } catch (error: any) {
    console.error("❌ API Error Details:", error.response?.data);
    return [];
  }
}

function estimateProgress(consultations: IntegratedConsultation[]): number {
  if (!consultations.length) return 0;
  const finished = consultations.filter((item) => item.status === 'finished').length;
  const ongoing = consultations.filter((item) => item.status === 'on_going').length;
  const score = finished * 12 + ongoing * 6;
  return Math.max(5, Math.min(100, score));
}

function toPositiveNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function findSupervisorIdFromThesis(thesis: any, lecturerId?: number): number {
  const supervisors = Array.isArray(thesis?.supervisors) ? thesis.supervisors : [];
  if (!supervisors.length) return 0;

  const targetLecturerId = toPositiveNumber(lecturerId);
  if (targetLecturerId > 0) {
    const matched = supervisors.find((item: any) => {
      const itemLecturerId = toPositiveNumber(item?.id_lecturer ?? item?.lecturer?.id_user_si);
      return itemLecturerId === targetLecturerId;
    });
    const matchedId = toPositiveNumber(matched?.id_supervisor);
    if (matchedId > 0) return matchedId;
  }

  return toPositiveNumber(supervisors[0]?.id_supervisor);
}

function getSupervisorId(
  raw: any,
  options?: { allowLooseId?: boolean; lecturerId?: number },
): number {
  const directId = toPositiveNumber(raw?.id_supervisor);
  if (directId > 0) return directId;

  const nestedId = toPositiveNumber(raw?.supervisor?.id_supervisor ?? raw?.supervision?.id_supervisor);
  if (nestedId > 0) return nestedId;

  const thesis = raw?.student_thesis ?? raw?.thesis;
  const fromThesisId = findSupervisorIdFromThesis(thesis, options?.lecturerId);
  if (fromThesisId > 0) return fromThesisId;

  if (options?.allowLooseId) {
    const looseId = toPositiveNumber(raw?.id);
    if (looseId > 0) {
      const looksLikeSupervisorEntity =
        raw?.supervisor ||
        raw?.consultations ||
        raw?.consultation_histories ||
        raw?.id_consultation;
      if (looksLikeSupervisorEntity) return looseId;
    }
  }

  return 0;
}

export const thesisIntegrationService = {
  async getPublishedTopicsForStudent(): Promise<IntegratedTopic[]> {
    try {
      // API contract: role mahasiswa uses GET /api/student/thesis/topics
      // We disable my_program filter to show all published lecturer topics in galeri.
      const topics = await studentTaService.getAvailableTopics(false);

      return topics
        .map((raw, index) => {
          const lecturer = raw?.lecturer ?? raw?.dosen ?? {};
          const quotaTotal = Number(raw?.quota ?? raw?.quota_total ?? raw?.max_quota ?? raw?.kuota ?? 1);
          const quotaFilled = Number(raw?.quota_filled ?? raw?.quota_used ?? raw?.filled ?? raw?.kuota_terisi ?? 0);

          return {
            id: Number(raw?.id_thesis_topic ?? raw?.id ?? index + 1),
            title: String(raw?.title_ind ?? raw?.title ?? '-'),
            category: String(raw?.topic ?? raw?.category?.name ?? raw?.category ?? '-'),
            lecturerId: Number(lecturer?.id_user_si ?? raw?.id_lecturer ?? 0),
            lecturerName: String(lecturer?.name ?? lecturer?.full_name ?? '-'),
            lecturerEmail: String(lecturer?.email ?? '-'),
            description: String(raw?.description ?? '-'),
            quotaTotal,
            quotaFilled,
            status: String(raw?.status ?? 'draft'),
            createdAt: String(raw?.created_at ?? new Date().toISOString()),
          } as IntegratedTopic;
        })
        .filter((item) => {
          const status = item.status.toLowerCase();
          const isPublished =
            status === 'published' ||
            status === 'publish' ||
            status === 'post' ||
            status === 'posted' ||
            status === 'available' ||
            status === 'taken' ||
            status === 'open' ||
            status === 'active' ||
            status === 'aktif';
          // Show all published items regardless of quota (user can see full quotas)
          return isPublished;
        });
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      // Graceful degradation on missing endpoint/network in development.
      if (error?.response?.status === 404 || !error?.response) {
        return [];
      }
      throw error;
    }
  },

  async requestMentorshipFromTopic(topicId: number, _lecturerId: number, studentNote?: string): Promise<void> {
    const formData = new FormData();
    const note = String(studentNote ?? '').trim();
    if (note) {
      formData.append('student_note', note);
    }

    await studentTaService.selectTopic(topicId, formData);
  },

  async getLecturerRequests(): Promise<IntegratedRequest[]> {
    const response = await getWithFallback<any>([
      '/api/lecturer/thesis/requests',
      '/api/lecturer/thesis/requests/pending',
      '/api/lecturer/thesis/submission-requests',
    ]);

    return asArray<any>(response).map(normalizeRequest);
  },

  async approveLecturerRequest(requestId: number): Promise<void> {
    await patchWithFallback([
      `/api/lecturer/thesis/requests/${requestId}/accept`,
      `/api/lecturer/thesis/requests/${requestId}/approve`,
      `/api/lecturer/thesis/requests/${requestId}`,
    ], {
      status: 'accepted',
    });
  },

  async rejectLecturerRequest(requestId: number, rejectionNote?: string): Promise<void> {
    await patchWithFallback([
      `/api/lecturer/thesis/requests/${requestId}/reject`,
      `/api/lecturer/thesis/requests/${requestId}`,
    ], {
      status: 'rejected',
      rejection_note: rejectionNote ?? 'Pengajuan belum dapat disetujui.',
    });
  },

  async getLecturerMonitoringStudents(): Promise<IntegratedMonitoringStudent[]> {
    try {
      const response = await getWithFallback<any>([
        '/api/lecturer/thesis/supervisees',
        '/api/lecturer/thesis/requests'
      ]);

      const requests = asArray<any>(response).filter((raw) => {
        const isExplicitSupervisor = Boolean(raw?.id_supervisor);
        const status = String(raw?.status ?? '').toLowerCase();
        return isExplicitSupervisor || status === 'accepted' || status === 'approved';
      });

      const mapped = await Promise.all(requests.map(async (raw) => {
        const thesis = raw?.student_thesis ?? raw?.thesis ?? raw;
        const lecturer = raw?.lecturer ?? raw?.dosen ?? {};
        const lecturerId = Number(lecturer?.id_user_si ?? raw?.id_lecturer ?? 0);
        const supervisorId = getSupervisorId(raw, { allowLooseId: false, lecturerId });

        const consultationsRawFromResponse = extractConsultationList(raw, thesis, supervisorId);
        const consultationsRaw = consultationsRawFromResponse.length
          ? consultationsRawFromResponse
          : await getConsultationsBySupervisor(supervisorId);
        const consultations = consultationsRaw.map(normalizeConsultation);

        return {
          supervisorId,
          studentId: Number(thesis?.id_student ?? thesis?.student?.id_user_si ?? raw?.student_id ?? 0),
          studentName: getStudentName(thesis),
          studentNim: getStudentNim(thesis),
          studentProgram: getStudentProgram(thesis),
          thesisTitle: String(thesis?.title_ind ?? thesis?.title ?? '-'),
          thesisStatus: String(thesis?.status ?? 'on_progress'),
          progress: estimateProgress(consultations),
          consultations,
          lecturerId,
          lecturerName: String(lecturer?.name ?? lecturer?.full_name ?? '-'),
        } as IntegratedMonitoringStudent;

      }));

      return mapped;
    } catch (error) {
      if (error?.response?.status === 404) {
        return [];
      }

      throw error;
    }
  },

  async createConsultation(
    supervisorId: number,
    payload: {
      consultation_date: string;
      subject: string;
      lecturer_notes?: string;
      student_notes?: string;
      status?: 'pending' | 'on_going' | 'finished' | 'rejected';
      end_time?: string;
      location?: string;
    },
  ): Promise<void> {
    const paths = [
      '/api/lecturer/thesis/consultations',
      `/api/lecturer/thesis/supervisors/${supervisorId}/consultations`,
      `/api/lecturer/thesis/supervisions/${supervisorId}/consultations`,
      '/api/lecturer/thesis/schedules',
      `/api/lecturer/thesis/supervisors/${supervisorId}/schedules`,
      `/api/lecturer/thesis/supervisions/${supervisorId}/schedules`,
    ];

    const endDateTime =
      payload.end_time && /^\d{2}:\d{2}$/.test(payload.end_time)
        ? `${payload.consultation_date.slice(0, 10)}T${payload.end_time}:00`
        : undefined;

    const jsonBody = {
      id_supervisor: supervisorId,
      consultation_date: payload.consultation_date,
      subject: payload.subject,
      lecturer_notes: payload.lecturer_notes ?? '',
      student_notes: payload.student_notes ?? '',
      status: payload.status ?? 'pending',
      end_time: payload.end_time,
      location: payload.location,
    };

    const jsonAliasBody = {
      id_supervision: supervisorId,
      supervisor_id: supervisorId,
      date: payload.consultation_date,
      start_time: payload.consultation_date,
      end_time: endDateTime ?? payload.end_time,
      subject: payload.subject,
      topic: payload.subject,
      location: payload.location,
      place: payload.location,
      lecturer_note: payload.lecturer_notes ?? '',
      lecturer_notes: payload.lecturer_notes ?? '',
      student_note: payload.student_notes ?? '',
      student_notes: payload.student_notes ?? '',
      status: payload.status ?? 'pending',
    };

    const formData = new FormData();
    formData.append('id_supervisor', String(supervisorId));
    formData.append('consultation_date', payload.consultation_date);
    formData.append('subject', payload.subject);
    if (payload.lecturer_notes) formData.append('lecturer_notes', payload.lecturer_notes);
    if (payload.student_notes) formData.append('student_notes', payload.student_notes);
    if (payload.status) formData.append('status', payload.status);
    if (payload.end_time) formData.append('end_time', payload.end_time);
    if (payload.location) formData.append('location', payload.location);

    const formDataAlias = new FormData();
    formDataAlias.append('id_supervision', String(supervisorId));
    formDataAlias.append('supervisor_id', String(supervisorId));
    formDataAlias.append('date', payload.consultation_date);
    formDataAlias.append('start_time', payload.consultation_date);
    if (endDateTime) formDataAlias.append('end_time', endDateTime);
    else if (payload.end_time) formDataAlias.append('end_time', payload.end_time);
    formDataAlias.append('topic', payload.subject);
    formDataAlias.append('subject', payload.subject);
    if (payload.location) {
      formDataAlias.append('location', payload.location);
      formDataAlias.append('place', payload.location);
    }
    if (payload.lecturer_notes) {
      formDataAlias.append('lecturer_note', payload.lecturer_notes);
      formDataAlias.append('lecturer_notes', payload.lecturer_notes);
    }
    if (payload.student_notes) {
      formDataAlias.append('student_note', payload.student_notes);
      formDataAlias.append('student_notes', payload.student_notes);
    }
    if (payload.status) formDataAlias.append('status', payload.status);

    await postWithPayloadFallback(paths, [
      { body: jsonBody },
      { body: jsonAliasBody },
      {
        body: formData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } },
      },
      {
        body: formDataAlias,
        config: { headers: { 'Content-Type': 'multipart/form-data' } },
      },
    ]);
  },

  async updateConsultationStatus(consultationId: number, status: 'finished'): Promise<void> {
    const paths = [
      `/api/lecturer/thesis/consultations/${consultationId}`,
      `/api/lecturer/thesis/schedules/${consultationId}`,
    ];

    const body = { status };
    
    // Also try as FormData as some endpoints might require it
    const formData = new FormData();
    formData.append('status', status);

    // Try JSON first, then FormData
    await putWithFallback(paths, body).catch((error: any) => {
      console.error("❌ API Error Details:", error.response?.data);
      return putWithFallback(paths, formData);
    }).catch((error: any) => {
      console.error("❌ API Error Details (FormData fallback):", error.response?.data);
      throw error;
    });
  },

  async getAdminRequests(): Promise<IntegratedRequest[]> {
    try {
      const response = await getWithFallback<any>(['/api/admin/thesis/requests']);
      return asArray<any>(response).map(normalizeRequest);
    } catch (error: any) {
      // If endpoint doesn't exist (404), return empty array for graceful degradation
      if (error?.response?.status === 404 || !error?.response) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[thesisIntegrationService] Admin requests endpoint not available. Showing empty dashboard.');
        }
        return [];
      }
      // For other errors (5xx, 422, etc), propagate to caller
      throw error;
    }
  },

  async assignLecturerByAdmin(thesisId: number, lecturerId: number): Promise<void> {
    await postWithFallback([
      `/api/admin/thesis/${thesisId}/assign-lecturer`,
      '/api/admin/thesis/assign-lecturer',
    ], {
      id_lecturer: lecturerId,
      id_student_thesis: thesisId,
    });
  },
};
