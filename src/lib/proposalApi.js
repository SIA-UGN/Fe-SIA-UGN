import api from './axios';

// ========================================
// PENELITIAN (PROPOSAL RISET) API
// BE: /api/lecturer/penelitian-proposal
// Alur status: Pengajuan -> (Aktif | Ditolak | Revisi); Aktif -> Selesai.
// ========================================

/** [DOSEN] Daftar penelitian (proposal) milik dosen login. */
export const getProposalList = async () => {
    const res = await api.get('/lecturer/penelitian-proposal');
    return res.data;
};

/** [DOSEN] Ajukan proposal penelitian baru (FormData). */
export const storeProposal = async (formData) => {
    const res = await api.post('/lecturer/penelitian-proposal', formData);
    return res.data;
};

/** [DOSEN] Edit proposal (Pengajuan/Revisi). */
export const updateProposal = async (id, formData) => {
    const res = await api.post(`/lecturer/penelitian-proposal/${id}/update`, formData);
    return res.data;
};

/** [DOSEN] Ajukan ulang setelah revisi (Revisi -> Pengajuan). */
export const ajukanProposal = async (id) => {
    const res = await api.post(`/lecturer/penelitian-proposal/${id}/ajukan`);
    return res.data;
};

/** [DOSEN] Tandai penelitian selesai (Aktif -> Selesai). Opsional kirim FormData (laporan akhir + luaran). */
export const selesaiProposal = async (id, formData) => {
    const res = await api.post(`/lecturer/penelitian-proposal/${id}/selesai`, formData);
    return res.data;
};

/** [DOSEN] Ambil 1 proposal dari list (prefill edit / halaman detail). */
export const getProposalById = async (id) => {
    const res = await api.get('/lecturer/penelitian-proposal');
    const list = res.data?.data ?? [];
    return list.find(p => String(p.id) === String(id)) ?? null;
};
