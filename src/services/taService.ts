import { studentThesisApi } from '@/features/bimbingan-ta/api/student';

export type TAStatus = 'diproses' | 'ditolak' | 'approved';

export interface Dosen {
  id: number;
  name: string;
  nip: string;
}

export interface PengajuanTA {
  id: number;
  tanggal: string;
  judul: string;
  dosen: string;
  id_dosen?: number;
  status: TAStatus;
  ringkasan?: string;
  attachment_url?: string;
}

export interface CreateTAPayload {
  judul: string;
  ringkasan: string;
  id_dosen: number;
  file?: File | null;
}

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
  },
};

