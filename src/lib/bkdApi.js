import api from './axios';

// ========================================
// BKD & ANGKA KREDIT API
// ========================================

/**
 * Input kegiatan BKD dosen
 * POST /api/lecturer/bkd/kegiatan
 * @param {object} data - { id_user_si, kategori, nama_kegiatan, sks_beban }
 */
export const storeKegiatanBkd = async (data) => {
    try {
        const response = await api.post('/lecturer/bkd/kegiatan', data);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Daftar master target Angka Kredit (kum) per jabatan fungsional.
 * GET /api/lecturer/bkd/master-jabatan
 */
export const getMasterJabatan = async () => {
    try {
        const response = await api.get('/lecturer/bkd/master-jabatan');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Katalog jenis kegiatan BKD + Angka Kredit per satuan (sumber dari BE, bukan hardcode FE).
 * GET /api/lecturer/bkd/master-kegiatan
 */
export const getMasterKegiatanBkd = async () => {
    try {
        const response = await api.get('/lecturer/bkd/master-kegiatan');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Cek eligibility kenaikan jabatan dosen
 * GET /api/lecturer/bkd/check-eligibility
 * @param {number|null} idUserSi - optional, default user yang login
 */
export const checkEligibility = async (idUserSi = null) => {
    try {
        const params = idUserSi ? `?id_user_si=${idUserSi}` : '';
        const response = await api.get(`/lecturer/bkd/check-eligibility${params}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Submit pengajuan kenaikan jabatan
 * POST /api/lecturer/bkd/submit-pengajuan
 * @param {FormData} formData - payload berisi dokumen fisik
 */
export const submitPengajuan = async (formData) => {
    try {
        const response = await api.post('/lecturer/bkd/submit-pengajuan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Cetak dokumen PAK
 * GET /api/lecturer/bkd/pengajuan/{id}/cetak-pak
 * @param {number} idPengajuan
 */
export const cetakPak = async (idPengajuan) => {
    try {
        const response = await api.get(`/lecturer/bkd/pengajuan/${idPengajuan}/cetak-pak`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Dapatkan riwayat BKD
 */
export const getDaftarBkd = async (idUserSi = null) => {
    try {
        const params = idUserSi ? `?id_user_si=${idUserSi}` : '';
        const response = await api.get(`/lecturer/bkd${params}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Finalisasi BKD dari draft ke diajukan (tunggu persetujuan manager)
 */
export const submitFinalisasi = async (idUserSi) => {
    try {
        const response = await api.post('/lecturer/bkd/finalisasi', { id_user_si: idUserSi });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}
