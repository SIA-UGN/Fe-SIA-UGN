import axios from "axios";
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // dari .env.local
  timeout: 10000, // 10 detik
  // Pesan error default saat timeout
  timeoutErrorMessage: 'Tidak dapat terhubung. Periksa internet Anda.',
});

api.interceptors.request.use((config) => {
  // Jangan kirim Authorization hanya untuk endpoint login
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
      const userMessage = 'Tidak dapat terhubung. Periksa internet Anda.';
      const normalizedError = {
        ...error,
        isConnectivityError: true,
        userMessage,
        message: userMessage,
      };
      return Promise.reject(normalizedError);
    }

    // For other errors (like CORS which also drops error.response), we want to let the app
    // decide how to handle them, rather than masking them as an "internet connection" error.
    if (!error?.response) {
      console.error('[Axios] Missing response. Possible CORS issue or server crash.', error);
    }

    return Promise.reject(error);
  }
);

export default api;
