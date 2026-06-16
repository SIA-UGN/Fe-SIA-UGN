/**
 * krsExportService.js
 * -------------------------------------------------------------
 * Domain: EXPORT / PREVIEW KRS yang sudah disetujui.
 * Endpoint terkait: A1 (metadata), A2 (PDF binary).
 *
 * Setiap fungsi membungkus 1 endpoint, memakai try/catch, dan
 * mengembalikan { data, error } — TIDAK melempar ke komponen.
 *
 * Catatan A2: response BUKAN JSON melainkan binary (application/pdf),
 * sehingga di-handle sebagai blob. `data` berisi { blob, filename, contentType }.
 */

import krsApiClient, { cleanParams, normalizeKrsError } from "./krsApiClient";
import { KRS_ENDPOINTS } from "./krsEndpoints";

/**
 * A1 — GET /student/krs/approved/metadata
 * Ambil metadata preview KRS yang sudah disetujui (link PDF inline/attachment).
 *
 * @param {{ id_academic_period?: number, id_krs_session?: number }} [params]
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getApprovedKrsMetadata(params = {}) {
  try {
    const response = await krsApiClient.get(KRS_ENDPOINTS.APPROVED_METADATA, {
      params: cleanParams(params),
    });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeKrsError(error) };
  }
}

/** Ambil filename dari header Content-Disposition (fallback bila tidak ada). */
function parseFilename(contentDisposition, fallback = "krs.pdf") {
  if (!contentDisposition) return fallback;
  // contoh: inline; filename="krs_2024.pdf"
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(
    contentDisposition
  );
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
}

/**
 * A2 — GET /student/krs/approved/pdf
 * Export KRS yang disetujui sebagai file PDF (binary/blob).
 *
 * @param {{ id_academic_period?: number, id_krs_session?: number, disposition?: 'inline'|'attachment' }} [params]
 * @returns {Promise<{ data: { blob: Blob, filename: string, contentType: string }|null, error: object|null }>}
 */
export async function downloadApprovedKrsPdf(params = {}) {
  try {
    const response = await krsApiClient.get(KRS_ENDPOINTS.APPROVED_PDF, {
      params: cleanParams(params),
      responseType: "blob",
    });

    const contentType =
      response.headers?.["content-type"] || "application/pdf";
    const filename = parseFilename(response.headers?.["content-disposition"]);

    return {
      data: { blob: response.data, filename, contentType },
      error: null,
    };
  } catch (error) {
    // Saat responseType 'blob', body error pun berupa Blob — ubah ke JSON dulu
    // agar normalizeKrsError bisa membaca pesan dari server.
    const parsedError = await blobErrorToJson(error);
    return { data: null, error: normalizeKrsError(parsedError) };
  }
}

/** Konversi error blob (dari request responseType:'blob') menjadi JSON. */
async function blobErrorToJson(error) {
  const data = error?.response?.data;
  const isBlob = typeof Blob !== "undefined" && data instanceof Blob;
  if (!isBlob) return error;

  try {
    const text = await data.text();
    error.response.data = JSON.parse(text);
  } catch (_e) {
    // biarkan apa adanya bila gagal di-parse
  }
  return error;
}

const krsExportService = {
  getApprovedKrsMetadata,
  downloadApprovedKrsPdf,
};

export default krsExportService;
