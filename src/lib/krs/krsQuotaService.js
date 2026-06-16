/**
 * krsQuotaService.js
 * -------------------------------------------------------------
 * Domain: KUOTA SKS mahasiswa.
 * Endpoint terkait: A6.
 *
 * Setiap fungsi membungkus 1 endpoint, memakai try/catch, dan
 * mengembalikan { data, error } — TIDAK melempar ke komponen.
 *   - sukses : { data: <envelope Laravel>, error: null }
 *   - gagal  : { data: null, error: <hasil normalizeKrsError> }
 */

import krsApiClient, { normalizeKrsError } from "./krsApiClient";
import { KRS_ENDPOINTS } from "./krsEndpoints";

/**
 * A6 — GET /student/krs/quota
 * Ambil informasi kuota SKS mahasiswa beserta sesi aktif.
 *
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getKrsQuota() {
  try {
    const response = await krsApiClient.get(KRS_ENDPOINTS.QUOTA);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

const krsQuotaService = {
  getKrsQuota,
};

export default krsQuotaService;
