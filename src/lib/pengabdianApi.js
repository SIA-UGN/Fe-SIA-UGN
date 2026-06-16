import api from './axios';

/**
 * [DOSEN] Ambil daftar kegiatan pengabdian masyarakat milik dosen yang login.
 * GET /api/lecturer/pengabdian
 * @param {string|null} tahun - Filter opsional berdasarkan tahun
 */
export const getPengabdianList = async (tahun = null) => {
    const params = {};
    if (tahun) params.tahun = tahun;
    const res = await api.get('/lecturer/pengabdian', { params });
    return res.data;
};

/**
 * [DOSEN] Simpan kegiatan pengabdian masyarakat baru.
 * POST /api/lecturer/pengabdian
 * @param {FormData} formData - Data form termasuk file_laporan (PDF)
 *
 * Required fields:
 *   judul_kegiatan, skema (Mandiri|Hibah Internal|Hibah Dikti|Lainnya),
 *   lokasi, tahun_pelaksanaan, authors (array: [{id_user_si, peran}])
 *
 * Optional:
 *   sumber_dana, jumlah_dana, file_laporan (PDF maks 5MB)
 */
export const storePengabdian = async (formData) => {
    const res = await api.post('/lecturer/pengabdian', formData);
    return res.data;
};

/** [DOSEN] Daftar user (dosen/mahasiswa) untuk dropdown pilih anggota tim. role: 'dosen' | 'mahasiswa'. */
export const getSelectableUsers = async (role) => {
    const res = await api.get('/lecturer/users', { params: { role } });
    return res.data;
};

/** [DOSEN] Ambil 1 PkM dari list (prefill edit / halaman detail). */
export const getPengabdianById = async (id) => {
    const res = await api.get('/lecturer/pengabdian');
    const list = res.data?.data ?? [];
    return list.find(p => String(p.id) === String(id)) ?? null;
};

/** [DOSEN] Edit PkM (Diajukan/Revisi) — FormData. */
export const updatePengabdian = async (id, formData) => {
    const res = await api.post(`/lecturer/pengabdian/${id}/update`, formData);
    return res.data;
};

/** [DOSEN] Ajukan ulang setelah revisi (Revisi -> Diajukan). */
export const ajukanPengabdian = async (id) => {
    const res = await api.post(`/lecturer/pengabdian/${id}/ajukan`);
    return res.data;
};

/** [DOSEN] Tandai PkM selesai (Aktif -> Selesai). Opsional kirim FormData (laporan akhir + bukti foto). */
export const selesaiPengabdian = async (id, formData) => {
    const res = await api.post(`/lecturer/pengabdian/${id}/selesai`, formData);
    return res.data;
};
