/**
 * academicPeriodService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Domain: Periode Akademik (Grup F, APIKRSMAHASISWAADMIN.readme)
 * Endpoint: F1–F6
 *
 * Setiap fungsi mengembalikan { data, error } — TIDAK melempar ke komponen.
 *
 * Catatan:
 *  - F1 & F2 bisa diakses semua user yang terautentikasi (bukan hanya admin/manager).
 *  - F3 (create): jika is_active=true, periode lain otomatis dinonaktifkan.
 *  - F5 (toggle): mengaktifkan periode menyebabkan periode lain nonaktif.
 *  - F6 (delete): gagal (422) jika masih ada kelas yang menggunakan periode ini.
 */

import apiManager, {
  normalizeManagerError,
} from "@/lib/apiManager";
import { MANAGER_ENDPOINTS } from "@/constants/managerEndpoints";

/**
 * F1 — GET /academic-periods
 * Daftar semua periode akademik.
 *
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getAcademicPeriods() {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.ACADEMIC_PERIODS);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * F2 — GET /academic-periods/{id}
 * Detail satu periode akademik beserta statistik kelas.
 *
 * @param {number|string} periodId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getAcademicPeriodDetail(periodId) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.ACADEMIC_PERIOD_DETAIL(periodId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * F3 — POST /academic-periods
 * Buat periode akademik baru.
 * Jika is_active=true, periode lain otomatis dinonaktifkan.
 *
 * @param {{ name: string, start_date: string, end_date: string, is_active: boolean, all_class?: boolean }} payload
 *   - name: format wajib "Semester Ganjil/Genap YYYY/YYYY"
 *   - start_date: format YYYY-MM-DD, tidak boleh sebelum hari ini
 *   - end_date: format YYYY-MM-DD, harus setelah start_date
 *   - all_class: jika true + is_active=true, aktifkan semua kelas periode ini
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createAcademicPeriod(payload) {
  try {
    const response = await apiManager.post(
      MANAGER_ENDPOINTS.ACADEMIC_PERIODS,
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * F4 — PUT /academic-periods/{id}
 * Update periode akademik (semua field wajib diisi ulang).
 * start_date boleh lampau (berbeda dengan F3).
 *
 * @param {number|string} periodId
 * @param {{ name: string, start_date: string, end_date: string, is_active: boolean, all_class?: boolean }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateAcademicPeriod(periodId, payload) {
  try {
    const response = await apiManager.put(
      MANAGER_ENDPOINTS.ACADEMIC_PERIOD_DETAIL(periodId),
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * F5 — PUT /academic-periods/{id}/toggle-status
 * Toggle aktif/nonaktif periode.
 * Jika diaktifkan, semua periode lain otomatis dinonaktifkan.
 *
 * @param {number|string} periodId
 * @param {{ all_class?: boolean }} [payload]
 *   - all_class: jika true dan periode diaktifkan, aktifkan semua kelas periode ini
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function toggleAcademicPeriodStatus(periodId, payload = {}) {
  try {
    const response = await apiManager.put(
      MANAGER_ENDPOINTS.ACADEMIC_PERIOD_TOGGLE(periodId),
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * F6 — DELETE /academic-periods/{id}
 * Hapus periode akademik. Gagal (422) jika masih ada kelas yang menggunakan
 * periode ini.
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} periodId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function deleteAcademicPeriod(periodId, confirmed = false) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk menghapus periode akademik.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.delete(
      MANAGER_ENDPOINTS.ACADEMIC_PERIOD_DETAIL(periodId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

const academicPeriodService = {
  getAcademicPeriods,
  getAcademicPeriodDetail,
  createAcademicPeriod,
  updateAcademicPeriod,
  toggleAcademicPeriodStatus,
  deleteAcademicPeriod,
};

export default academicPeriodService;
