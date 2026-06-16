/**
 * managerApi.js
 * Helper API untuk modul Manajer — petakan ke endpoint BE-SIA-UGN.
 */
import api from './axios';

// ── Gambar 1: Daftar Dosen ───────────────────────────────────────────────────
// GET /api/manager/payroll/lecturers (paginated, includes position & program_name)
export const getManagerLecturers = async (params = {}) => {
    const res = await api.get('/manager/payroll/lecturers', { params });
    return res.data;
};

// ── Gambar 2: Profil Detail Dosen ────────────────────────────────────────────
// GET /api/manager/lecturers/{id}/profile
export const getManagerLecturerProfile = async (id) => {
    const res = await api.get(`/manager/lecturers/${id}/profile`);
    return res.data;
};

// ── Gambar 3: Aktivitas Dosen (Angka Kredit, Publikasi, Pengabdian) ──────────
// GET /api/manager/lecturers/{id}/aktivitas
export const getManagerLecturerAktivitas = async (id) => {
    const res = await api.get(`/manager/lecturers/${id}/aktivitas`);
    return res.data;
};

// ── Gambar 4: Rekap Presensi Per Kelas ───────────────────────────────────────
// GET /api/manager/payroll/lecturers/{id}/attendance/subjects?bulan=&tahun=
export const getManagerLecturerRekapPresensi = async (id, bulan, tahun) => {
    const res = await api.get(`/manager/payroll/lecturers/${id}/attendance/subjects`, {
        params: { bulan, tahun },
    });
    return res.data;
};

// ── Gambar 4: Detail Kehadiran Per Pertemuan (satu kelas) ────────────────────
// GET /api/manager/payroll/lecturers/{id}/attendance/subjects/{classId}?bulan=&tahun=
export const getManagerAttendanceDetail = async (lecturerId, classId, bulan, tahun) => {
    const res = await api.get(
        `/manager/payroll/lecturers/${lecturerId}/attendance/subjects/${classId}`,
        { params: { bulan, tahun } }
    );
    return res.data;
};

// ── Gambar 4: Koreksi Kehadiran Manual oleh Manajer ─────────────────────────
// PATCH /api/manager/payroll/lecturers/{id}/attendance/subjects/{classId}/schedules/{scheduleId}
export const updateManagerAttendance = async (lecturerId, classId, scheduleId, body) => {
    const res = await api.patch(
        `/manager/payroll/lecturers/${lecturerId}/attendance/subjects/${classId}/schedules/${scheduleId}`,
        body
    );
    return res.data;
};

// ── Gambar 4: Slip Gaji (Final atau Estimasi) ─────────────────────────────────
// GET /api/manager/payroll/lecturers/{id}/slip?bulan=&tahun=
export const getManagerLecturerSlip = async (id, bulan, tahun) => {
    const res = await api.get(`/manager/payroll/lecturers/${id}/slip`, {
        params: { bulan, tahun },
    });
    return res.data;
};

// ── Daftar Slip Gaji Dosen (semua bulan/tahun) ───────────────────────────────
// GET /api/manager/payroll/lecturers/{id}/slips?tahun=
export const getManagerLecturerSlips = async (id, tahun) => {
    const res = await api.get(`/manager/payroll/lecturers/${id}/slips`, {
        params: tahun ? { tahun } : {},
    });
    return res.data;
};

// ── Download PDF Slip Gaji Dosen (oleh Manager) ──────────────────────────────
// GET /api/manager/payroll/lecturers/{lecturerId}/slips/{slipId}/pdf
export const downloadManagerLecturerSlipPdf = async (lecturerId, slipId) => {
    const res = await api.get(
        `/manager/payroll/lecturers/${lecturerId}/slips/${slipId}/pdf`,
        { responseType: 'blob' }
    );
    return res.data;
};

// ── BKD / Angka Kredit ───────────────────────────────────────────────────────
export const getManagerPengajuanBkd = async () => {
    const res = await api.get('/manager/bkd/pengajuan');
    return res.data;
};
export const validasiPengajuanBkd = async (id, body) => {
    const res = await api.put(`/manager/bkd/pengajuan/${id}/validasi`, body);
    return res.data;
};

// ── Review BKD (manager verifikasi BKD dosen) ────────────────────────────────
export const getBkdSubmissions = async () => {
    const res = await api.get('/manager/bkd/submissions');
    return res.data;
};
export const validasiBkdSubmission = async (id, body) => {
    const res = await api.put(`/manager/bkd/submissions/${id}/validasi`, body);
    return res.data;
};

// Helper: terima string (status_validasi) ATAU objek body apa adanya.
const toStatusBody = (payload) =>
    typeof payload === 'string' ? { status_validasi: payload } : (payload ?? {});

// ── Penelitian Ilmiah ─────────────────────────────────────────────────────────
export const getPenelitianManager = async () => {
    const res = await api.get('/manager/penelitian');
    return res.data;
};
export const validasiPenelitian = async (id, payload) => {
    const res = await api.put(`/manager/penelitian/${id}/validasi`, toStatusBody(payload));
    return res.data;
};

// ── Penelitian (Proposal riset) — review manager ─────────────────────────────
export const getProposalManager = async () => {
    const res = await api.get('/manager/penelitian-proposal');
    return res.data;
};
export const validasiProposal = async (id, body) => {
    const res = await api.put(`/manager/penelitian-proposal/${id}/validasi`, body);
    return res.data;
};

// [KELOMPOK 1] Pengabdian Masyarakat = modul kelompok lain, tidak dimasukkan ke merge ini.

// ── Kegiatan Pengajar ─────────────────────────────────────────────────────────
export const getKegiatanManager = async () => {
    const res = await api.get('/manager/kegiatan-pengajar');
    return res.data;
};
export const validasiKegiatan = async (id, payload) => {
    const res = await api.put(`/manager/kegiatan-pengajar/${id}/validasi`, toStatusBody(payload));
    return res.data;
};
