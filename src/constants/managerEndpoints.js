/**
 * Konstanta path endpoint Admin/Manager KRS.
 * Referensi: APIKRSMAHASISWAADMIN.readme
 *
 * Aturan:
 *  - Path TIDAK menyertakan base URL (/api/...) — base URL dikelola di apiManager.js
 *  - Fungsi dinamis menerima ID sebagai argumen dan mengembalikan string path
 */

export const MANAGER_ENDPOINTS = {
  // ── A. Monitoring & Persetujuan KRS ────────────────────────────────────────
  /** A1  GET  Ringkasan mahasiswa pengajuan KRS */
  KRS_STUDENTS: "/manager/krs/students",
  /** A2  GET  Semua entri KRS (level per-MK) */
  KRS_ALL: "/manager/krs",
  /** A3  GET  Detail KRS satu mahasiswa */
  KRS_STUDENT_DETAIL: (studentId) => `/manager/krs/students/${studentId}`,
  /** A4  PATCH Setujui KRS */
  KRS_APPROVE: (id) => `/manager/krs/${id}/approve`,
  /** A5  PATCH Tolak KRS */
  KRS_REJECT: (id) => `/manager/krs/${id}/reject`,

  // ── B. Manajemen Sesi KRS ───────────────────────────────────────────────────
  /** B1 GET / B2 POST */
  KRS_SESSIONS: "/manager/krs-sessions",
  /** B3 GET */
  KRS_SESSION_DETAIL: (id) => `/manager/krs-sessions/${id}`,
  /** B4 PATCH Tutup sesi */
  KRS_SESSION_CLOSE: (id) => `/manager/krs-sessions/${id}/close`,
  /** B5 GET / B6 POST Kelas dalam sesi */
  KRS_SESSION_CLASSES: (sessionId) =>
    `/manager/krs-sessions/${sessionId}/classes`,
  /** B7 DELETE Hapus kelas dari sesi */
  KRS_SESSION_CLASS_REMOVE: (sessionId, classId) =>
    `/manager/krs-sessions/${sessionId}/classes/${classId}`,

  // ── C. Manajemen Kuota SKS ──────────────────────────────────────────────────
  /** C1 GET / C2 POST */
  KRS_QUOTAS: "/manager/krs-quotas",
  /** C3 GET / C4 PATCH / C5 DELETE */
  KRS_QUOTA_DETAIL: (id) => `/manager/krs-quotas/${id}`,

  // ── D. Manajemen Mata Kuliah ────────────────────────────────────────────────
  /** D1 GET / D2 POST */
  SUBJECTS: "/manager/subjects",
  /** D3 GET / D4 PUT / D5 DELETE */
  SUBJECT_DETAIL: (id) => `/manager/subjects/${id}`,

  // ── E. Manajemen Kelas ──────────────────────────────────────────────────────
  /** E1 GET / E2 POST */
  CLASSES: "/manager/classes",
  /** E3 GET / E4 PUT */
  CLASS_DETAIL: (id) => `/manager/classes/${id}`,
  /** E5 PATCH Toggle aktif/nonaktif */
  CLASS_TOGGLE_STATUS: (id) => `/manager/classes/${id}/toggle-status`,
  /** E6 POST Assign dosen */
  CLASS_LECTURERS: (id) => `/manager/classes/${id}/lecturers`,
  /** E8 DELETE Detach dosen */
  CLASS_LECTURER_REMOVE: (classId, lecturerId) =>
    `/manager/classes/${classId}/lecturers/${lecturerId}`,
  /** E7 POST Assign mahasiswa */
  CLASS_STUDENTS: (id) => `/manager/classes/${id}/students`,
  /** E9 DELETE Detach mahasiswa */
  CLASS_STUDENT_REMOVE: (classId, studentId) =>
    `/manager/classes/${classId}/students/${studentId}`,

  // ── F. Periode Akademik ─────────────────────────────────────────────────────
  /** F1 GET / F3 POST */
  ACADEMIC_PERIODS: "/academic-periods",
  /** F2 GET / F4 PUT / F6 DELETE */
  ACADEMIC_PERIOD_DETAIL: (id) => `/academic-periods/${id}`,
  /** F5 PUT Toggle status aktif */
  ACADEMIC_PERIOD_TOGGLE: (id) => `/academic-periods/${id}/toggle-status`,
};
