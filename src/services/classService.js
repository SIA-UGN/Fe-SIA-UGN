/**
 * classService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Domain: Manajemen Kelas — Admin/Manager (Grup E, APIKRSMAHASISWAADMIN.readme)
 * Endpoint: E1–E9
 *
 * Setiap fungsi mengembalikan { data, error } — TIDAK melempar ke komponen.
 * E8 (detach dosen) dan E9 (detach mahasiswa) memerlukan confirmed === true.
 *
 * Catatan:
 *  - E4 (PUT) tidak bisa mengubah day_of_week jika kelas sudah punya jadwal.
 *  - E7 (assign mahasiswa) cek kapasitas di sisi backend.
 *  - day_of_week di response adalah integer: 1=Senin … 7=Minggu.
 */

import apiManager, {
  normalizeManagerError,
} from "@/lib/apiManager";
import { MANAGER_ENDPOINTS } from "@/constants/managerEndpoints";

/**
 * E1 — GET /manager/classes
 * Daftar semua kelas (tanpa pagination).
 *
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getClasses() {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.CLASSES);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E2 — POST /manager/classes
 * Buat kelas baru.
 *
 * @param {{ id_subject: number, id_academic_period: number, code_class: string, member_class: number, day_of_week: number, start_time: string, end_time: string, is_active?: boolean }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createClass(payload) {
  try {
    const response = await apiManager.post(MANAGER_ENDPOINTS.CLASSES, payload);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E3 — GET /manager/classes/{id}
 * Detail kelas lengkap: mata kuliah, periode, dosen, mahasiswa, jadwal.
 *
 * @param {number|string} classId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getClassDetail(classId) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.CLASS_DETAIL(classId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E4 — PUT /manager/classes/{id}
 * Update data kelas (semua field wajib diisi ulang).
 * Gagal (422) jika mengubah day_of_week padahal sudah ada jadwal.
 *
 * @param {number|string} classId
 * @param {{ id_subject: number, id_academic_period: number, code_class: string, member_class: number, day_of_week: number, start_time: string, end_time: string, is_active?: boolean }} payload
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateClass(classId, payload) {
  try {
    const response = await apiManager.put(
      MANAGER_ENDPOINTS.CLASS_DETAIL(classId),
      payload
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E5 — PATCH /manager/classes/{id}/toggle-status
 * Toggle status aktif/nonaktif kelas.
 *
 * @param {number|string} classId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function toggleClassStatus(classId) {
  try {
    const response = await apiManager.patch(
      MANAGER_ENDPOINTS.CLASS_TOGGLE_STATUS(classId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E6 — POST /manager/classes/{id}/lecturers
 * Assign dosen ke kelas. Gagal (422) jika user bukan dosen.
 *
 * @param {number|string} classId
 * @param {number} lecturerId - id_user_si dosen
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function assignLecturerToClass(classId, lecturerId) {
  try {
    const response = await apiManager.post(
      MANAGER_ENDPOINTS.CLASS_LECTURERS(classId),
      { id_user_si: lecturerId }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E7 — POST /manager/classes/{id}/students
 * Assign mahasiswa ke kelas. Gagal (422) jika bukan mahasiswa atau kelas penuh.
 *
 * @param {number|string} classId
 * @param {number} studentId - id_user_si mahasiswa
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function assignStudentToClass(classId, studentId) {
  try {
    const response = await apiManager.post(
      MANAGER_ENDPOINTS.CLASS_STUDENTS(classId),
      { id_user_si: studentId }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E8 — DELETE /manager/classes/{id}/lecturers/{lecturerId}
 * Detach dosen dari kelas (destruktif).
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} classId
 * @param {number|string} lecturerId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function removeLecturerFromClass(
  classId,
  lecturerId,
  confirmed = false
) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk melepas dosen dari kelas.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.delete(
      MANAGER_ENDPOINTS.CLASS_LECTURER_REMOVE(classId, lecturerId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * E9 — DELETE /manager/classes/{id}/students/{studentId}
 * Detach mahasiswa dari kelas (destruktif).
 *
 * Memerlukan confirmed === true.
 *
 * @param {number|string} classId
 * @param {number|string} studentId
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function removeStudentFromClass(
  classId,
  studentId,
  confirmed = false
) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk melepas mahasiswa dari kelas.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.delete(
      MANAGER_ENDPOINTS.CLASS_STUDENT_REMOVE(classId, studentId)
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

const classService = {
  getClasses,
  createClass,
  getClassDetail,
  updateClass,
  toggleClassStatus,
  assignLecturerToClass,
  assignStudentToClass,
  removeLecturerFromClass,
  removeStudentFromClass,
};

export default classService;
