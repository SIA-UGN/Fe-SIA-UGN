/**
 * subjectService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Domain: Manajemen Mata Kuliah — Admin/Manager (Grup D, APIKRSMAHASISWAADMIN.readme)
 * Endpoint: D1–D5
 *
 * Setiap fungsi mengembalikan { data, error } — TIDAK melempar ke komponen.
 * D5 (delete) memerlukan confirmed === true karena gagal jika masih ada kelas
 * atau nilai yang menggunakan mata kuliah tersebut.
 */

import apiManager, {
  normalizeManagerError,
} from "@/lib/apiManager";
import { MANAGER_ENDPOINTS } from "@/constants/managerEndpoints";

/**
 * D1 — GET /manager/subjects
 * Daftar semua mata kuliah (tanpa pagination).
 *
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getSubjects() {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.SUBJECTS);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * D2 — POST /manager/subjects
 * Buat mata kuliah baru.
 *
 * @param {{ name_subject: string, code_subject: string, sks: number }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createSubject(payload) {
  try {
    const response = await apiManager.post(MANAGER_ENDPOINTS.SUBJECTS, payload);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * D3 — GET /manager/subjects/{id}
 * Detail mata kuliah.
 *
 * @param {number|string} subjectId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getSubjectDetail(subjectId) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.SUBJECT_DETAIL(subjectId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * D4 — PUT /manager/subjects/{id}
 * Update mata kuliah (semua field wajib diisi ulang).
 *
 * @param {number|string} subjectId
 * @param {{ name_subject: string, code_subject: string, sks: number }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateSubject(subjectId, payload) {
  try {
    const response = await apiManager.put(
      MANAGER_ENDPOINTS.SUBJECT_DETAIL(subjectId),
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * D5 — DELETE /manager/subjects/{id}
 * Hapus mata kuliah. Gagal (409) jika masih dipakai kelas atau ada nilai mahasiswa.
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} subjectId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function deleteSubject(subjectId, confirmed = false) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk menghapus mata kuliah.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.delete(
      MANAGER_ENDPOINTS.SUBJECT_DETAIL(subjectId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

const subjectService = {
  getSubjects,
  createSubject,
  getSubjectDetail,
  updateSubject,
  deleteSubject,
};

export default subjectService;
