/**
 * Barrel export untuk layer fetching KRS Mahasiswa.
 * -------------------------------------------------------------
 * Memudahkan import dari satu titik, contoh:
 *
 *   import { getKrsQuota, submitKrs, getAvailableKrsClasses } from "@/lib/krs";
 *
 * Struktur:
 *   - krsApiClient.js       -> axios instance + interceptor (transport)
 *   - krsEndpoints.js       -> konstanta path endpoint
 *   - krsQuotaService.js    -> A6
 *   - krsSessionService.js  -> A3, A4, A5, A7
 *   - krsService.js         -> A8, A9, A10
 *   - krsExportService.js   -> A1, A2
 */

export { default as krsApiClient, cleanParams, normalizeKrsError } from "./krsApiClient";
export { KRS_ENDPOINTS } from "./krsEndpoints";

// Kuota (A6)
export { getKrsQuota } from "./krsQuotaService";

// Sesi & kelas (A3, A4, A5, A7)
export {
  getOpenKrsSessions,
  getKrsSessionDetail,
  getKrsSessionClasses,
  getAvailableKrsClasses,
} from "./krsSessionService";

// Pengajuan KRS (A8, A9, A10)
export {
  getMyKrsSubmissions,
  submitKrs,
  cancelKrsSubmission,
} from "./krsService";

// Export / preview PDF (A1, A2)
export {
  getApprovedKrsMetadata,
  downloadApprovedKrsPdf,
} from "./krsExportService";
