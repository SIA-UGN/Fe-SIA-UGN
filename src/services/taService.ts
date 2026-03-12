import axiosInstance from '@/lib/axios';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TAStatus = 'diproses' | 'ditolak' | 'approved';

export interface Dosen {
  id: number;
  name: string;
  nip: string;
}

export interface PengajuanTA {
  id: number;
  tanggal: string;          // ISO date string
  judul: string;
  dosen: string;             // Dosen name (display)
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

/* ------------------------------------------------------------------ */
/*  Service (placeholder — swap with real endpoints later)             */
/* ------------------------------------------------------------------ */

export const taService = {
  /**
   * Fetch all TA submissions for the current student.
   */
  getAll: async (): Promise<PengajuanTA[]> => {
    // TODO: replace with real endpoint
    // const { data } = await axiosInstance.get<{ data: PengajuanTA[] }>('/ta/pengajuan');
    // return data.data;

    // ── Mock data ──────────────────────────────────────────────
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: 1,
              tanggal: '2025-06-10',
              judul: 'Pengembangan Sistem Informasi Akademik Berbasis Web',
              dosen: 'Dr. Ahmad Fauzi, M.Kom.',
              status: 'approved',
            },
            {
              id: 2,
              tanggal: '2025-05-22',
              judul: 'Analisis Sentimen Media Sosial Menggunakan NLP',
              dosen: 'Prof. Siti Nurhaliza, Ph.D.',
              status: 'diproses',
            },
            {
              id: 3,
              tanggal: '2025-04-15',
              judul: 'Implementasi Machine Learning untuk Prediksi Cuaca',
              dosen: 'Dr. Budi Santoso, M.T.',
              status: 'ditolak',
            },
            {
              id: 4,
              tanggal: '2025-03-08',
              judul: 'Rancang Bangun Aplikasi E-Commerce dengan Microservices',
              dosen: 'Dr. Ahmad Fauzi, M.Kom.',
              status: 'diproses',
            },
          ]),
        800,
      ),
    );
  },

  /**
   * Create a new TA pengajuan (multipart for file upload).
   */
  create: async (payload: CreateTAPayload) => {
    // TODO: replace with real endpoint
    // const formData = new FormData();
    // formData.append('judul', payload.judul);
    // formData.append('ringkasan', payload.ringkasan);
    // formData.append('id_dosen', String(payload.id_dosen));
    // if (payload.file) formData.append('file', payload.file);
    // return axiosInstance.post('/ta/pengajuan', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // });

    return new Promise<{ success: boolean }>((resolve) =>
      setTimeout(() => resolve({ success: true }), 1000),
    );
  },

  /**
   * Fetch list of available dosen pembimbing.
   */
  getDosenList: async (): Promise<Dosen[]> => {
    // TODO: replace with real endpoint
    // const { data } = await axiosInstance.get<{ data: Dosen[] }>('/ta/dosen');
    // return data.data;

    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            { id: 1, name: 'Dr. Ahmad Fauzi, M.Kom.', nip: '198501012010011001' },
            { id: 2, name: 'Prof. Siti Nurhaliza, Ph.D.', nip: '197803152005012001' },
            { id: 3, name: 'Dr. Budi Santoso, M.T.', nip: '198207202008011002' },
            { id: 4, name: 'Dr. Rina Wulandari, M.Cs.', nip: '199001102015012001' },
          ]),
        500,
      ),
    );
  },
};
