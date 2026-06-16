/**
 * krsApiClient.js
 * -------------------------------------------------------------
 * API client khusus untuk fitur KRS Mahasiswa.
 *
 * Tanggung jawab file ini HANYA transport layer:
 *   - Base URL dari env (tidak ada hardcode).
 *   - Auto-attach Authorization Bearer dari satu sumber token (cookie).
 *   - Timeout default (dari env, dengan fallback).
 *   - Interceptor error global:
 *       401 -> bersihkan sesi + redirect ke halaman login.
 *       5xx -> log error ke console.
 *
 * Business logic (endpoint mana, arti param) TIDAK ditulis di sini —
 * itu tugas file *Service.js. File ini sengaja dipisah dari service.
 */

import axios from "axios";
import Cookies from "js-cookie";

// --- Konstanta transport (tidak ada nilai sensitif yang di-hardcode) ---
const AUTH_TOKEN_COOKIE = "token"; // sumber tunggal token (di-set saat login)
const SESSION_COOKIES = ["token", "roles", "user_id"]; // dibersihkan saat 401
const LOGIN_ROUTE = "/loginpage";
const DEFAULT_TIMEOUT = 30000;

/** Ambil base URL dari env, buang trailing slash. */
function resolveBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return raw.replace(/\/+$/, "");
}

/** Timeout dari env (NEXT_PUBLIC_API_TIMEOUT) dengan fallback aman. */
function resolveTimeout() {
  const raw = Number(process.env.NEXT_PUBLIC_API_TIMEOUT);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT;
}

const krsApiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: resolveTimeout(),
  timeoutErrorMessage: "Permintaan timeout. Periksa koneksi Anda dan coba lagi.",
  headers: {
    Accept: "application/json",
  },
});

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR: attach token + Content-Type
// ---------------------------------------------------------------------------
krsApiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers.Accept = config.headers.Accept ?? "application/json";

  // Token diambil dari SATU sumber: cookie "token".
  const token = Cookies.get(AUTH_TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Set Content-Type JSON hanya untuk method yang punya body & bukan FormData.
  const method = String(config.method ?? "get").toLowerCase();
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  const methodHasBody = method !== "get" && method !== "head" && method !== "delete";

  if (!isFormData && !config.headers["Content-Type"] && methodHasBody) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR: penanganan error global
// ---------------------------------------------------------------------------
krsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 401 -> token kadaluarsa/invalid: bersihkan sesi & redirect ke login.
    if (status === 401) {
      SESSION_COOKIES.forEach((name) => Cookies.remove(name));

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith(LOGIN_ROUTE)
      ) {
        window.location.href = LOGIN_ROUTE;
      }
    }

    // 5xx -> log untuk keperluan debugging.
    if (status >= 500) {
      console.error(
        "[KRS API] Server error",
        status,
        error?.config?.method?.toUpperCase(),
        error?.config?.url,
        error?.response?.data ?? error?.message
      );
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// HELPER TRANSPORT (dipakai bersama oleh service)
// ---------------------------------------------------------------------------

/**
 * Buang param yang kosong (undefined/null/'') agar query string bersih.
 * @param {Record<string, unknown>} params
 * @returns {Record<string, unknown>}
 */
export function cleanParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
}

/**
 * Ubah AxiosError menjadi bentuk error yang konsisten & ramah UI.
 * Service mengembalikan objek ini di field `error` (tidak melempar).
 *
 * Penanganan status code mengikuti APIKRSMAHASISWA.readme:
 *  400 Bad Request | 401 Unauthorized | 403 Forbidden |
 *  404 Not Found  | 422 Validation/Business rule | 500 Server error.
 *
 * @param {unknown} error - error dari axios
 * @returns {{ status: number|null, message: string, errors: object|null, isConnectivityError: boolean }}
 */
export function normalizeKrsError(error) {
  const status = error?.response?.status ?? null;
  const serverData = error?.response?.data ?? null;

  // Error koneksi / timeout (tidak ada response dari server).
  if (!error?.response) {
    const isTimeout =
      error?.code === "ECONNABORTED" ||
      String(error?.message ?? "").toLowerCase().includes("timeout");

    return {
      status: null,
      message: isTimeout
        ? "Permintaan timeout. Server mungkin sedang sibuk, coba lagi sebentar."
        : "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      errors: null,
      isConnectivityError: true,
    };
  }

  const validationErrors =
    serverData?.errors && typeof serverData.errors === "object"
      ? serverData.errors
      : null;
  const firstValidationMessage = getFirstValidationMessage(validationErrors);
  const serverMessage =
    serverData?.message || serverData?.error || firstValidationMessage;

  const fallbackByStatus = {
    400: "Permintaan tidak valid. Periksa kembali data yang dikirim.",
    401: "Sesi Anda telah berakhir. Silakan login kembali.",
    403: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
    404: "Data yang diminta tidak ditemukan.",
    422: "Data tidak valid atau melanggar aturan. Periksa kembali.",
    500: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
  };

  // Untuk 404 & 422, pesan dari server lebih informatif (business rule),
  // jadi diutamakan. Untuk status lain pakai server message bila ada.
  const message =
    serverMessage ||
    fallbackByStatus[status] ||
    "Terjadi kesalahan. Silakan coba lagi.";

  return {
    status,
    message,
    errors: validationErrors,
    isConnectivityError: false,
  };
}

/** Ambil pesan pertama dari objek validasi Laravel { field: [msg] }. */
function getFirstValidationMessage(errors) {
  if (!errors || typeof errors !== "object") return null;

  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return null;

  const firstValue = errors[firstKey];
  const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue;
  return firstMessage || null;
}

export default krsApiClient;
