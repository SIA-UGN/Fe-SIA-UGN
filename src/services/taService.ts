import { studentThesisApi } from '@/features/bimbingan-ta/api/student';

/** Status `student_thesis` */
export type TAStudentStatus = 'proposing' | 'on_progress' | 'revision' | 'finished';

/** Status `thesis_lecturer` (permintaan ke dosen) */
export type TALecturerRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Dosen {
  id_user_si: number;
  name: string;
  username?: string;
  email?: string;
  staff_profile?: {
    full_name?: string;
    employee_id_number?: string;
    position?: string;
  };
}

<<<<<<< HEAD
export interface ThesisLecturer {
  id_thesis_lecturer: number;
  id_student_thesis: number;
  id_lecturer: number;
  status: TALecturerRequestStatus;
  student_note: string | null;
  rejection_note: string | null;
  created_at: string;
  updated_at: string;
  lecturer: { id_user_si: number; name: string; email?: string };
}

export interface ThesisSupervisor {
  id_supervisor: number;
  id_student_thesis: number;
  id_lecturer: number;
  created_at: string;
  lecturer: { id_user_si: number; name: string; email?: string };
  consultations?: Consultation[];
}

export interface Consultation {
  id_consultation: number;
  id_supervisor: number;
  consultation_date: string;
  subject: string;
  student_notes: string | null;
  lecturer_notes: string | null;
  attachment: string | null;
  status: 'pending' | 'on_going' | 'finished' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface StudentThesis {
  id_student_thesis: number;
  id_student: number;
  id_program: number;
  id_thesis_topic: number | null;
  topic: string | null;
  title_ind: string;
  title_eng: string;
  status: TAStudentStatus;
  description: string;
  attachment_proposal: string | null;
  created_at: string;
  updated_at: string;
  thesis_lecturers?: ThesisLecturer[];
  supervisors?: ThesisSupervisor[];
=======
export interface PengajuanTA {
  id: number;
  tanggal: string;
  judul: string;
  dosen: string;
  id_dosen?: number;
  status: TAStatus;
  ringkasan?: string;
  attachment_url?: string;
>>>>>>> origin/tugasakhir
}

export interface CreateTAPayload {
  title_ind: string;
  title_eng: string;
  description: string;
  topic?: string;
  attachment_proposal?: File | null;
  /** ID dosen yang akan langsung dimintai bimbingan setelah submit */
  id_lecturer: number;
  student_note?: string;
}

<<<<<<< HEAD
/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export const taService = {
  /**
   * GET /api/student/thesis
   * Ambil data TA mahasiswa yang sedang login. Mengembalikan null jika belum ada.
   */
  getMyThesis: async (): Promise<StudentThesis | null> => {
    const { data } = await axiosInstance.get<{
      status: string;
      data: StudentThesis | null;
    }>('/api/student/thesis');
    return data.data;
  },

  /**
   * POST /api/student/thesis
   * Buat pengajuan TA baru (mandiri). Mengembalikan StudentThesis yang baru dibuat.
   */
  create: async (payload: Omit<CreateTAPayload, 'id_lecturer' | 'student_note'> & { attachment_proposal?: File | null }): Promise<StudentThesis> => {
    const formData = new FormData();
    formData.append('title_ind', payload.title_ind);
    formData.append('title_eng', payload.title_eng);
    formData.append('description', payload.description);
    if (payload.topic) formData.append('topic', payload.topic);
    if (payload.attachment_proposal) formData.append('attachment_proposal', payload.attachment_proposal);

    const { data } = await axiosInstance.post<{ status: string; data: StudentThesis }>(
      '/api/student/thesis',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  /**
   * POST /api/student/thesis/{id}/request-lecturer
   * Kirim permintaan bimbingan ke dosen setelah thesis dibuat.
   */
  requestLecturer: async (
    thesisId: number,
    payload: { id_lecturer: number; student_note?: string },
  ): Promise<ThesisLecturer> => {
    const { data } = await axiosInstance.post<{ status: string; data: ThesisLecturer }>(
      `/api/student/thesis/${thesisId}/request-lecturer`,
      { id_lecturer: payload.id_lecturer, student_note: payload.student_note ?? '' },
    );
    return data.data;
  },

  /**
   * GET /api/student/thesis/lecturers
   * Daftar dosen aktif yang bisa dipilih sebagai pembimbing.
   */
  getDosenList: async (): Promise<Dosen[]> => {
    const { data } = await axiosInstance.get<{ status: string; data: Dosen[] }>(
      '/api/student/thesis/lecturers',
    );
    return data.data;
  },

  /**
   * GET /api/student/thesis/requests
   * Riwayat seluruh permintaan pembimbing yang pernah dikirim.
   */
  getRequestHistory: async (): Promise<ThesisLecturer[]> => {
    const { data } = await axiosInstance.get<{ status: string; data: ThesisLecturer[] }>(
      '/api/student/thesis/requests',
    );
    return data.data;
=======
function mapRequestStatus(status?: string): TAStatus {
  if (status === 'accepted') return 'approved';
  if (status === 'rejected') return 'ditolak';
  return 'diproses';
}

export const taService = {
  async getAll(): Promise<PengajuanTA[]> {
    const [thesis, requests] = await Promise.all([
      studentThesisApi.getCurrentThesis(),
      studentThesisApi.getRequests(),
    ]);

    if (!thesis) {
      return [];
    }

    if (requests.length === 0) {
      return [
        {
          id: thesis.id_student_thesis,
          tanggal: thesis.created_at || new Date().toISOString(),
          judul: thesis.title_ind,
          dosen: thesis.supervisors?.[0]?.lecturer?.name || '-',
          id_dosen: thesis.supervisors?.[0]?.id_lecturer,
          status: thesis.status === 'finished' ? 'approved' : 'diproses',
          ringkasan: thesis.description || '',
          attachment_url: thesis.attachment_proposal || undefined,
        },
      ];
    }

    return requests.map((request) => ({
      id: request.id_thesis_lecturer,
      tanggal: request.created_at || thesis.created_at || new Date().toISOString(),
      judul: request.student_thesis?.title_ind || thesis.title_ind,
      dosen: request.lecturer?.name || `Dosen #${request.id_lecturer}`,
      id_dosen: request.id_lecturer,
      status: mapRequestStatus(request.status),
      ringkasan: request.student_thesis?.description || thesis.description || '',
      attachment_url:
        request.student_thesis?.attachment_proposal || thesis.attachment_proposal || undefined,
    }));
  },

  async create(payload: CreateTAPayload) {
    const thesis = await studentThesisApi.createThesis({
      title_ind: payload.judul,
      title_eng: payload.judul,
      topic: payload.judul,
      description: payload.ringkasan,
      attachment_proposal: payload.file || null,
    });

    await studentThesisApi.requestLecturer(thesis.id_student_thesis, {
      id_lecturer: payload.id_dosen,
    });

    return { success: true };
  },

  async getDosenList(): Promise<Dosen[]> {
    const lecturers = await studentThesisApi.getLecturers();
    return lecturers.map((lecturer) => ({
      id: lecturer.id_user_si,
      name: lecturer.name,
      nip: lecturer.staff_profile?.employee_id_number || lecturer.username || '-',
    }));
>>>>>>> origin/tugasakhir
  },
};

