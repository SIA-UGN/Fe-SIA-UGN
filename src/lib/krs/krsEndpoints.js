/**
 * krsEndpoints.js
 * -------------------------------------------------------------
 * Satu-satunya sumber path endpoint KRS Mahasiswa (role: mahasiswa).
 * Semua service WAJIB mengambil path dari sini — jangan hardcode
 * string path di dalam service.
 *
 * Catatan: path bersifat RELATIF terhadap NEXT_PUBLIC_API_BASE_URL,
 * yang sudah berakhiran "/api" (lihat .env). Jadi tidak perlu
 * menambahkan prefix "/api" lagi.
 *
 * Referensi: APIKRSMAHASISWA.readme — Bagian A. STUDENT KRS (A1–A10).
 */

export const KRS_ENDPOINTS = {
  // --- A1 & A2: Export / preview KRS yang sudah disetujui ---
  APPROVED_METADATA: "/student/krs/approved/metadata", // A1  GET
  APPROVED_PDF: "/student/krs/approved/pdf", // A2  GET (binary/blob)

  // --- A3, A4, A5, A7: Sesi KRS & daftar kelas ---
  SESSIONS: "/student/krs/sessions", // A3  GET (sesi open)
  SESSION_DETAIL: (sessionId) => `/student/krs/sessions/${sessionId}`, // A4  GET
  SESSION_CLASSES: (sessionId) => `/student/krs/sessions/${sessionId}/classes`, // A5  GET (paginated)
  AVAILABLE_CLASSES: "/student/krs/available-classes", // A7  GET

  // --- A6: Kuota SKS mahasiswa ---
  QUOTA: "/student/krs/quota", // A6  GET

  // --- A8, A9, A10: Pengajuan KRS ---
  KRS: "/student/krs", // A8 GET (list) | A9 POST (ajukan)
  KRS_DETAIL: (krsId) => `/student/krs/${krsId}`, // A10 DELETE (batalkan)
};

export default KRS_ENDPOINTS;
