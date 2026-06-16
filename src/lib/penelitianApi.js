import api from './axios';

// ========================================
// PENELITIAN ILMIAH (Publikasi/Luaran) API
// BE: /api/lecturer/penelitian  (skema publikasi: jurnal, prosiding, buku, paten)
// ========================================

/**
 * [DOSEN] Ambil daftar publikasi penelitian milik dosen yang login.
 * GET /api/lecturer/penelitian
 */
export const getPenelitianList = async () => {
    const res = await api.get('/lecturer/penelitian');
    return res.data;
};

/**
 * [DOSEN] Simpan publikasi penelitian baru.
 * POST /api/lecturer/penelitian
 * @param {FormData} formData - judul, jenis_output (Jurnal Nasional|Jurnal Internasional|
 *   Prosiding|Buku|Paten), tahun_terbit (4 digit), nama_publikasi, volume?, nomor?,
 *   halaman?, penerbit?, doi_url?, status_akreditasi?, file_artikel? (PDF),
 *   authors[] ({ id_user_si, peran: 'Penulis Utama'|'Anggota', urutan })
 */
export const storePenelitian = async (formData) => {
    const res = await api.post('/lecturer/penelitian', formData);
    return res.data;
};

/**
 * [DOSEN] Edit penelitian (hanya saat status Draft/Revisi).
 * POST /api/lecturer/penelitian/{id}/update
 */
export const updatePenelitian = async (id, formData) => {
    const res = await api.post(`/lecturer/penelitian/${id}/update`, formData);
    return res.data;
};

/**
 * [DOSEN] Ajukan penelitian ke manager (Draft/Revisi -> Diajukan).
 * POST /api/lecturer/penelitian/{id}/ajukan
 */
export const ajukanPenelitian = async (id) => {
    const res = await api.post(`/lecturer/penelitian/${id}/ajukan`);
    return res.data;
};

/**
 * [DOSEN] Ambil 1 penelitian dari list (helper prefill form edit / halaman detail).
 */
export const getPenelitianById = async (id) => {
    const res = await api.get('/lecturer/penelitian');
    const list = res.data?.data ?? [];
    return list.find(p => String(p.id) === String(id)) ?? null;
};
