/**
 * krsService.js
 * -------------------------------------------------------------
 * Domain: PENGAJUAN KRS mahasiswa (inti pengisian KRS).
 * Endpoint terkait: A8 (list), A9 (ajukan), A10 (batalkan).
 *
 * Setiap fungsi membungkus 1 endpoint, memakai try/catch, dan
 * mengembalikan { data, error } — TIDAK melempar ke komponen.
 */

import krsApiClient, { cleanParams, normalizeKrsError } from "./krsApiClient";
import { KRS_ENDPOINTS } from "./krsEndpoints";

/**
 * A8 — GET /student/krs
 * Ambil daftar pengajuan KRS milik mahasiswa (semua status:
 * pending / approved / rejected).
 *
 * @param {{ id_academic_period?: number }} [params] - filter opsional.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getMyKrsSubmissions(params = {}) {
  try {
    const response = await krsApiClient.get(KRS_ENDPOINTS.KRS, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

/**
 * A9 — POST /student/krs
 * Ajukan KRS baru (pilih kelas untuk satu mata kuliah).
 *
 * @param {{ id_class: number, id_krs_session?: number }} payload
 *   - id_class (wajib): ID kelas yang ingin diambil.
 *   - id_krs_session (opsional): jika kosong, backend memakai sesi aktif.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function submitKrs(payload) {
  try {
    const body = { id_class: payload?.id_class };
    if (payload?.id_krs_session != null) {
      body.id_krs_session = payload.id_krs_session;
    }

    const response = await krsApiClient.post(KRS_ENDPOINTS.KRS, body);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

/**
 * A10 — DELETE /student/krs/{id}
 * Batalkan pengajuan KRS. Hanya KRS berstatus `pending` yang bisa dibatalkan
 * (validasi dilakukan backend; error 422 dikembalikan via field `error`).
 *
 * @param {number|string} krsId - KRS ID (wajib).
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function cancelKrsSubmission(krsId) {
  try {
    const response = await krsApiClient.delete(KRS_ENDPOINTS.KRS_DETAIL(krsId));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

const krsService = {
  getMyKrsSubmissions,
  submitKrs,
  cancelKrsSubmission,
};

export default krsService;
