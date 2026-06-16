/**
 * krsApprovalService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Domain: Monitoring & Persetujuan KRS (Grup A, APIKRSMAHASISWAADMIN.readme)
 * Endpoint: A1–A5
 *
 * Setiap fungsi mengembalikan { data, error } — TIDAK melempar ke komponen.
 *
 * [MERGE] getKRSWithProfile — gabungkan data KRS dengan profil mahasiswa
 *         untuk mengisi gap NIM / prodi / semester / IPK yang tidak ada di
 *         response endpoint KRS.
 */

import apiManager, {
  normalizeManagerError,
  cleanParams,
} from "@/lib/apiManager";
import { MANAGER_ENDPOINTS } from "@/constants/managerEndpoints";

/**
 * A1 — GET /manager/krs/students
 * Ringkasan mahasiswa yang mengajukan KRS (paginated, per-mahasiswa).
 *
 * @param {{ id_academic_period?: number, id_krs_session?: number, action_needed?: boolean, search?: string, per_page?: number, page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsStudentsSummary(params = {}) {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.KRS_STUDENTS, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * A2 — GET /manager/krs
 * Semua entri pengajuan KRS (level per-MK, bukan per-mahasiswa).
 *
 * @param {{ status?: string, id_krs_session?: number, id_academic_period?: number, id_subject?: number, search?: string, per_page?: number, page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getAllKrsSubmissions(params = {}) {
  try {
    const response = await apiManager.get(MANAGER_ENDPOINTS.KRS_ALL, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * [MERGE] A1 + profil mahasiswa
 * Daftar ringkasan KRS mahasiswa yang sudah dilengkapi dengan data profil
 * (NIM, program_studi, semester, IPK) via GET /mahasiswa?username=xxx.
 *
 * Strategi:
 *  - Ambil daftar dari A1 terlebih dahulu.
 *  - Fetch profil tiap mahasiswa secara paralel dengan Promise.allSettled agar
 *    satu kegagalan profil tidak membatalkan seluruh list.
 *  - Jika profil gagal/tidak ada, field NIM/prodi/semester/IPK fallback ke "-".
 *
 * @param {{ id_academic_period?: number, id_krs_session?: number, action_needed?: boolean, search?: string, per_page?: number, page?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKRSWithProfile(params = {}) {
  const { data: krsResult, error: krsError } =
    await getKrsStudentsSummary(params);
  if (krsError) return { data: null, error: krsError };

  const students = krsResult?.data?.data ?? [];
  if (students.length === 0) return { data: krsResult.data, error: null };

  const profileResults = await Promise.allSettled(
    students.map((item) =>
      apiManager
        .get("/mahasiswa", {
          params: cleanParams({ username: item.student?.username }),
        })
        .then((r) => r.data?.data ?? null)
        .catch(() => null)
    )
  );

  const merged = students.map((item, idx) => {
    const profileData =
      profileResults[idx].status === "fulfilled"
        ? profileResults[idx].value
        : null;
    return {
      ...item,
      nim: profileData?.nim ?? item.student?.username ?? "-",
      program_studi: profileData?.program_studi ?? "-",
      semester: profileData?.semester ?? "-",
      ipk: profileData?.ipk ?? "-",
    };
  });

  return {
    data: { ...krsResult.data, data: merged },
    error: null,
  };
}

/**
 * A3 — GET /manager/krs/students/{studentId}
 * Detail lengkap seluruh pengajuan KRS satu mahasiswa.
 *
 * @param {number|string} studentId
 * @param {{ id_academic_period?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getStudentKrsDetail(studentId, params = {}) {
  try {
    const response = await apiManager.get(
      MANAGER_ENDPOINTS.KRS_STUDENT_DETAIL(studentId),
      { params: cleanParams(params) }
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * A4 — PATCH /manager/krs/{id}/approve
 * Setujui pengajuan KRS (hanya berstatus pending).
 *
 * catatan opsional — backend tidak menyimpannya (field tidak ada di skema BE),
 * tetapi dikirim agar FE tidak perlu mengubah signature fungsi jika BE nanti
 * menambah support catatan approver.
 *
 * @param {number|string} id - KRS ID
 * @param {string} [catatan=""] - Catatan opsional dari approver
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function approveKRS(id, catatan = "") {
  try {
    const body = {};
    if (catatan && catatan.trim()) body.catatan = catatan.trim();
    const response = await apiManager.patch(
      MANAGER_ENDPOINTS.KRS_APPROVE(id),
      body
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

/**
 * A5 — PATCH /manager/krs/{id}/reject
 * Tolak pengajuan KRS dengan alasan (wajib, min 10 karakter).
 *
 * Memerlukan konfirmasi eksplisit (confirmed === true) karena tindakan ini
 * berdampak langsung pada mahasiswa dan tidak dapat dibatalkan via UI.
 *
 * @param {number|string} id - KRS ID
 * @param {string} catatan - Alasan penolakan (wajib, min 10 karakter)
 * @param {boolean} confirmed - Harus true; fungsi no-op jika false
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function rejectKRS(id, catatan, confirmed = false) {
  if (!confirmed) {
    return {
      data: null,
      error: {
        status: 0,
        message: "Konfirmasi diperlukan untuk menolak KRS.",
        errors: null,
        isConnectivityError: false,
      },
    };
  }
  try {
    const response = await apiManager.patch(MANAGER_ENDPOINTS.KRS_REJECT(id), {
      rejection_reason: catatan,
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeManagerError(error) };
  }
}

const krsApprovalService = {
  getKrsStudentsSummary,
  getAllKrsSubmissions,
  getKRSWithProfile,
  getStudentKrsDetail,
  approveKRS,
  rejectKRS,
};

export default krsApprovalService;
