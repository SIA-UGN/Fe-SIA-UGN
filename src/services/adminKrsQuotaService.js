/**
 * adminKrsQuotaService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Domain: Manajemen Kuota SKS Mahasiswa — Admin/Manager (Grup C, APIKRSMAHASISWAADMIN.readme)
 * Endpoint: C1–C5
 *
 * Setiap fungsi mengembalikan { data, error } — TIDAK melempar ke komponen.
 * C2 bersifat upsert (POST untuk create maupun update berdasarkan kombinasi
 * id_user_si + id_academic_period).
 *
 * Catatan penamaan: file ini dinamai "adminKrsQuotaService" agar tidak bentrok
 * dengan src/lib/krs/krsQuotaService.js yang melayani endpoint mahasiswa.
 */

import apiManager, {
  normalizeManagerError,
  cleanParams,
} from "@/lib/apiManager";
import { MANAGER_ENDPOINTS } from "@/constants/managerEndpoints";

/**
 * C1 — GET /manager/krs-quotas
 * Daftar kuota KRS seluruh mahasiswa (paginated).
 *
 * @param {{ id_academic_period?: number, search?: string, per_page?: number, page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsQuotas(params = {}) {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.KRS_QUOTAS, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * C2 — POST /manager/krs-quotas
 * Tetapkan atau perbarui kuota SKS mahasiswa (upsert per mahasiswa per periode).
 * 201 = kuota baru, 200 = update kuota yang sudah ada.
 *
 * @param {{ id_user_si: number, id_academic_period: number, max_sks: number, notes?: string }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function upsertKrsQuota(payload) {
  try {
    const response = await apiManager.post(
      MANAGER_ENDPOINTS.KRS_QUOTAS,
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * C3 — GET /manager/krs-quotas/{id}
 * Detail kuota KRS mahasiswa beserta kalkulasi SKS terpakai/disetujui/sisa.
 *
 * @param {number|string} quotaId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsQuotaDetail(quotaId) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.KRS_QUOTA_DETAIL(quotaId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * C4 — PATCH /manager/krs-quotas/{id}
 * Update kuota SKS mahasiswa yang sudah ada.
 *
 * @param {number|string} quotaId
 * @param {{ max_sks?: number, notes?: string }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateKrsQuota(quotaId, payload) {
  try {
    const response = await apiManager.patch(
      MANAGER_ENDPOINTS.KRS_QUOTA_DETAIL(quotaId),
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * C5 — DELETE /manager/krs-quotas/{id}
 * Hapus kuota KRS mahasiswa (destruktif).
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} quotaId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function deleteKrsQuota(quotaId, confirmed = false) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk menghapus kuota KRS.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.delete(
      MANAGER_ENDPOINTS.KRS_QUOTA_DETAIL(quotaId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

const adminKrsQuotaService = {
  getKrsQuotas,
  upsertKrsQuota,
  getKrsQuotaDetail,
  updateKrsQuota,
  deleteKrsQuota,
};

export default adminKrsQuotaService;
