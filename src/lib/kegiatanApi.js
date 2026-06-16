import api from './axios';

// ========================================
// KEGIATAN MENGAJAR (Kegiatan Pengajar) API
// BE: /api/lecturer/kegiatan-pengajar
// ========================================

/**
 * [DOSEN] Ambil daftar kegiatan mengajar milik dosen yang login.
 * GET /api/lecturer/kegiatan-pengajar
 * Response: { status, beban_mengajar_aktif, data: [...] }
 * @param {{ semester?: string, tahun_ajaran?: string }} params - filter opsional
 */
export const getKegiatanList = async (params = {}) => {
    const res = await api.get('/lecturer/kegiatan-pengajar', { params });
    return res.data;
};

/**
 * [DOSEN] Simpan kegiatan mengajar baru.
 * POST /api/lecturer/kegiatan-pengajar
 * @param {FormData} formData - mata_kuliah, kode_mk, sks, kelas,
 *   semester (Ganjil|Genap), tahun_ajaran, file_bukti (PDF, opsional)
 */
export const storeKegiatan = async (formData) => {
    const res = await api.post('/lecturer/kegiatan-pengajar', formData);
    return res.data;
};

/**
 * [DOSEN] Edit kegiatan (hanya saat status Draft/Revisi).
 * POST /api/lecturer/kegiatan-pengajar/{id}/update
 */
export const updateKegiatan = async (id, formData) => {
    const res = await api.post(`/lecturer/kegiatan-pengajar/${id}/update`, formData);
    return res.data;
};

/**
 * [DOSEN] Ajukan kegiatan ke manager (Draft/Revisi -> Diajukan).
 * POST /api/lecturer/kegiatan-pengajar/{id}/ajukan
 */
export const ajukanKegiatan = async (id) => {
    const res = await api.post(`/lecturer/kegiatan-pengajar/${id}/ajukan`);
    return res.data;
};

/**
 * [DOSEN] Ambil 1 kegiatan dari list (helper untuk prefill form edit).
 */
export const getKegiatanById = async (id) => {
    const res = await api.get('/lecturer/kegiatan-pengajar');
    const list = res.data?.data ?? [];
    return list.find(k => String(k.id) === String(id)) ?? null;
};

/**
 * [DOSEN] Ambil 1 kegiatan (kelas) dari list berdasarkan id_class — untuk halaman detail.
 */
export const getKegiatanByClass = async (idClass) => {
    const res = await api.get('/lecturer/kegiatan-pengajar');
    const list = res.data?.data ?? [];
    return list.find(k => String(k.id_class) === String(idClass)) ?? null;
};

/**
 * [DOSEN] Ajukan / ajukan ulang klaim AK untuk satu kelas (upload berkas wajib via FormData).
 * POST /api/lecturer/kegiatan-pengajar/class/{id_class}/ajukan
 */
export const ajukanKegiatanKelas = async (idClass, formData) => {
    const res = await api.post(`/lecturer/kegiatan-pengajar/class/${idClass}/ajukan`, formData);
    return res.data;
};
