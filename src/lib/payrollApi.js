import api from './axios';

/**
 * Payroll API Module
 * Handles all payroll/slip gaji related API calls
 */

// =============================================
// GET slip gaji list milik dosen login
// Query param opsional: ?tahun=2026
// =============================================
export const getPayrollList = async (tahun = null) => {
    try {
        const url = tahun ? `/lecturer/payroll?tahun=${tahun}` : `/lecturer/payroll`;
        const res = await api.get(url);
        return res.data;
    } catch (err) {
        throw err.response?.data ?? err;
    }
};

// =============================================
// Generate slip gaji bulan tertentu
// Prasyarat: rekap presensi sudah di-generate dulu
// =============================================
export const generateSlipGaji = async (bulan, tahun) => {
    try {
        const res = await api.post('/lecturer/payroll/generate', { bulan, tahun });
        return res.data;
    } catch (err) {
        throw err.response?.data ?? err;
    }
};

// =============================================
// Download PDF slip gaji
// =============================================
export const downloadSlipGajiPDF = async (id) => {
    try {
        const res = await api.get(`/lecturer/payroll/${id}/pdf`, {
            responseType: 'blob',
        });
        return res.data; // Blob
    } catch (err) {
        throw err.response?.data ?? err;
    }
};

// =============================================
// Generate rekap presensi (wajib sebelum generate slip)
// =============================================
export const generateRekap = async (bulan, tahun) => {
    try {
        const res = await api.post('/lecturer/attendance/recap/generate', { bulan, tahun });
        return res.data;
    } catch (err) {
        throw err.response?.data ?? err;
    }
};

// =============================================
// Get rekap presensi dosen (untuk data kehadiran)
// =============================================
export const getRekapPresensi = async (bulan = null, tahun = null) => {
    try {
        const params = new URLSearchParams();
        if (bulan) params.append('bulan', bulan);
        if (tahun) params.append('tahun', tahun);
        const url = `/lecturer/attendance/recap${params.toString() ? '?' + params.toString() : ''}`;
        const res = await api.get(url);
        return res.data;
    } catch (err) {
        throw err.response?.data ?? err;
    }
};
