/**
 * krsSessionService.js
 * -------------------------------------------------------------
 * Domain: SESI KRS & daftar kelas yang tersedia (jadwal).
 * Endpoint terkait: A3, A4, A5, A7.
 *
 * Setiap fungsi membungkus 1 endpoint, memakai try/catch, dan
 * mengembalikan { data, error } — TIDAK melempar ke komponen.
 */

import krsApiClient, { cleanParams, normalizeKrsError } from "./krsApiClient";
import { KRS_ENDPOINTS } from "./krsEndpoints";

/**
 * A3 — GET /student/krs/sessions
 * Ambil daftar sesi KRS yang sedang `open`.
 *
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getOpenKrsSessions() {
  try {
    const response = await krsApiClient.get(KRS_ENDPOINTS.SESSIONS);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

/**
 * A4 — GET /student/krs/sessions/{id}
 * Detail sesi KRS + daftar kelas dikelompokkan per mata kuliah.
 *
 * @param {number|string} sessionId - KRS session ID (wajib).
 * @param {{ id_subject?: number, search?: string }} [params] - filter opsional.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsSessionDetail(sessionId, params = {}) {
  try {
    const response = await krsApiClient.get(
      KRS_ENDPOINTS.SESSION_DETAIL(sessionId),
      { params: cleanParams(params) }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

/**
 * A5 — GET /student/krs/sessions/{id}/classes
 * Daftar kelas dalam sesi KRS tertentu (paginated).
 *
 * @param {number|string} sessionId - KRS session ID (wajib).
 * @param {{ id_subject?: number, search?: string, per_page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsSessionClasses(sessionId, params = {}) {
  try {
    const response = await krsApiClient.get(
      KRS_ENDPOINTS.SESSION_CLASSES(sessionId),
      { params: cleanParams(params) }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

/**
 * A7 — GET /student/krs/available-classes
 * Daftar kelas yang masih bisa dipilih (mata kuliah yang belum diajukan),
 * sudah difilter terhadap sesi aktif.
 *
 * @param {{ id_subject?: number, search?: string }} [params] - filter opsional.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getAvailableKrsClasses(params = {}) {
  try {
    const response = await krsApiClient.get(KRS_ENDPOINTS.AVAILABLE_CLASSES, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

const krsSessionService = {
  getOpenKrsSessions,
  getKrsSessionDetail,
  getKrsSessionClasses,
  getAvailableKrsClasses,
};

export default krsSessionService;
