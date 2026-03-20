import axios from "axios";
import Cookies from 'js-cookie';

const resolveApiBaseUrl = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';

  return rawBaseUrl.replace(/\/+$/, '');
};

const getFirstValidationMessage = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const firstKey = Object.keys(errors)[0];
  if (!firstKey) {
    return null;
  }

  const firstValue = errors[firstKey];
  const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue;

  if (!firstMessage) {
    return null;
  }

  return `${firstKey}: ${firstMessage}`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000,
  timeoutErrorMessage: 'Tidak dapat terhubung. Periksa internet Anda.',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers.Accept = config.headers.Accept ?? 'application/json';

  const method = String(config.method ?? 'get').toLowerCase();
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (!isFormData && !config.headers['Content-Type'] && method !== 'get' && method !== 'head' && method !== 'delete') {
    config.headers['Content-Type'] = 'application/json';
  }

  const url = config.url || '';
  const isLoginEndpoint = url.includes('/auth/login');
  if (!isLoginEndpoint) {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor response untuk mengubah error timeout/network menjadi pesan yang lebih jelas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = (error && error.message) || '';
    const isTimeout = error?.code === 'ECONNABORTED' || message.toLowerCase().includes('timeout');
    const isNetworkError = !error?.response && (
      message.toLowerCase() === 'network error' || message.toLowerCase().includes('failed to fetch')
    );

    // If it's a true network error, simplify the message
    if (isTimeout || isNetworkError) {
      const userMessage = isTimeout
        ? 'Permintaan timeout. Server mungkin sedang booting, coba lagi dalam beberapa detik.'
        : 'Tidak dapat terhubung. Periksa koneksi internet Anda.';
      const normalizedError = {
        ...error,
        isConnectivityError: true,
        userMessage,
        message: userMessage,
      };
      return Promise.reject(normalizedError);
    }

    if (!error?.response) {
      console.error('[Axios] Missing response. Possible CORS issue or server crash.', error);
    }

    const serverData = error?.response?.data;
    const validationMessage = getFirstValidationMessage(serverData?.errors);
    const serverMessage =
      validationMessage ||
      serverData?.message ||
      serverData?.error;

    if (serverMessage) {
      error.message = serverMessage;
      error.userMessage = serverMessage;
    }

    return Promise.reject(error);
  }
);

export default api;
