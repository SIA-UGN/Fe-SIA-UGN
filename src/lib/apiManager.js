import axios from "axios";
import Cookies from "js-cookie";

const LOGIN_ROUTE = "/loginpage";
const AUTH_TOKEN_COOKIE = "token";
const SESSION_COOKIES = ["token", "roles", "user_id", "name"];

function resolveBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
}

const apiManager = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auth Sanctum berbasis Bearer token → lampirkan token dari cookie "token"
// (sumber token yang sama dengan client lain di app ini). Tanpa ini semua
// request manager mengembalikan 401.
apiManager.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_TOKEN_COOKIE);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiManager.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        SESSION_COOKIES.forEach((name) => Cookies.remove(name));
        if (!window.location.pathname.startsWith(LOGIN_ROUTE)) {
          window.location.href = LOGIN_ROUTE;
        }
      }
    }

    if (status === 403) {
      const err = new Error(
        "Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini."
      );
      err.status = 403;
      err.originalError = error;
      return Promise.reject(err);
    }

    if (status >= 500) {
      console.error(
        "[Manager API] Server error",
        status,
        error?.config?.url,
        error?.response?.data
      );
    }

    return Promise.reject(error);
  }
);

/**
 * Normalisasi error axios menjadi objek { status, message, errors, isConnectivityError }.
 * Dipakai di semua service manager — tidak melempar, hanya mengembalikan descriptor.
 */
export function normalizeManagerError(error) {
  if (!error) {
    return {
      status: 0,
      message: "Terjadi kesalahan tidak diketahui.",
      errors: null,
      isConnectivityError: false,
    };
  }

  // Error sudah dinormalisasi dari interceptor 403
  if (error.status === 403) {
    return {
      status: 403,
      message: error.message,
      errors: null,
      isConnectivityError: false,
    };
  }

  const isTimeout =
    error?.code === "ECONNABORTED" ||
    String(error?.message).toLowerCase().includes("timeout");
  const isNetworkError =
    !error?.response &&
    (String(error?.message).toLowerCase() === "network error" ||
      String(error?.message).toLowerCase().includes("failed to fetch"));

  if (isTimeout) {
    return {
      status: 0,
      message:
        "Permintaan timeout. Server mungkin sedang tidak aktif, coba lagi.",
      errors: null,
      isConnectivityError: true,
    };
  }
  if (isNetworkError) {
    return {
      status: 0,
      message:
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      errors: null,
      isConnectivityError: true,
    };
  }

  const status = error?.response?.status ?? 0;
  const data = error?.response?.data ?? {};

  const fallbacks = {
    400: "Permintaan tidak valid.",
    401: "Sesi habis. Silakan login kembali.",
    403: "Akses ditolak.",
    404: "Data tidak ditemukan.",
    422: "Data tidak valid. Periksa kembali isian Anda.",
    500: "Terjadi kesalahan pada server. Coba lagi nanti.",
  };

  const message =
    data?.message || fallbacks[status] || "Terjadi kesalahan.";
  const errors = data?.errors ?? null;

  return { status, message, errors, isConnectivityError: false };
}

/**
 * Hapus key dengan nilai undefined, null, atau string kosong dari query params
 * sebelum dikirim ke axios.
 */
export function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
}

export default apiManager;
