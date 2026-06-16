/**
 * adminKrsSessionService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Domain: Manajemen Sesi KRS — Admin/Manager (Grup B, APIKRSMAHASISWAADMIN.readme)
 * Endpoint: B1–B7
 *
 * Setiap fungsi mengembalikan { data, error } — TIDAK melempar ke komponen.
 * Fungsi destruktif (close session, hapus kelas dari sesi) memerlukan
 * confirmed === true.
 *
 * Catatan penamaan: file ini sengaja dinamai "adminKrsSessionService" (bukan
 * "krsSessionService") agar tidak bentrok dengan src/lib/krs/krsSessionService.js
 * yang melayani endpoint mahasiswa (student-facing).
 */

import apiManager, {
  normalizeManagerError,
  cleanParams,
} from "@/lib/apiManager";
import { MANAGER_ENDPOINTS } from "@/constants/managerEndpoints";

/**
 * B1 — GET /manager/krs-sessions
 * Daftar semua sesi KRS dengan filter dan pagination.
 *
 * @param {{ status?: 'open'|'closed', id_academic_period?: number, per_page?: number, page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsSessions(params = {}) {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.KRS_SESSIONS, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * B2 — POST /manager/krs-sessions
 * Buka sesi KRS baru. Opsional: langsung daftarkan kelas ke sesi.
 *
 * @param {{ id_academic_period: number, notes?: string, classes?: { id_class: number }[] }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createKrsSession(payload) {
  try {
    const response = await apiManager.post(
      MANAGER_ENDPOINTS.KRS_SESSIONS,
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * B3 — GET /manager/krs-sessions/{id}
 * Detail sesi KRS beserta statistik jumlah pengajuan.
 *
 * @param {number|string} sessionId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsSessionDetail(sessionId) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.KRS_SESSION_DETAIL(sessionId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * B4 — PATCH /manager/krs-sessions/{id}/close
 * Tutup sesi KRS (destruktif — mahasiswa tidak bisa daftar setelahnya).
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} sessionId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function closeKrsSession(sessionId, confirmed = false) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk menutup sesi KRS.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.patch(
      MANAGER_ENDPOINTS.KRS_SESSION_CLOSE(sessionId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * B5 — GET /manager/krs-sessions/{id}/classes
 * Daftar kelas yang terdaftar dalam sesi KRS (paginated).
 *
 * @param {number|string} sessionId
 * @param {{ id_subject?: number, search?: string, per_page?: number, page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsSessionClasses(sessionId, params = {}) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.KRS_SESSION_CLASSES(sessionId),
      { params: cleanParams(params) }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * B6 — POST /manager/krs-sessions/{id}/classes
 * Tambah kelas ke sesi KRS (batch).
 *
 * @param {number|string} sessionId
 * @param {{ classes: { id_class: number }[] }} payload - min 1 item
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function addClassesToKrsSession(sessionId, payload) {
  try {
    const response = await apiManager.post(
      MANAGER_ENDPOINTS.KRS_SESSION_CLASSES(sessionId),
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * B7 — DELETE /manager/krs-sessions/{id}/classes/{class_id}
 * Hapus kelas dari sesi KRS (destruktif).
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} sessionId
 * @param {number|string} classId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function removeClassFromKrsSession(
  sessionId,
  classId,
  confirmed = false
) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk menghapus kelas dari sesi.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.delete(
      MANAGER_ENDPOINTS.KRS_SESSION_CLASS_REMOVE(sessionId, classId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

const adminKrsSessionService = {
  getKrsSessions,
  createKrsSession,
  getKrsSessionDetail,
  closeKrsSession,
  getKrsSessionClasses,
  addClassesToKrsSession,
  removeClassFromKrsSession,
};

export default adminKrsSessionService;
