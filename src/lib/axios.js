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
      message.toLowerCase().includes('network') || message.toLowerCase().includes('failed')
    );

    if (isTimeout || isNetworkError) {
      const userMessage = 'Tidak dapat terhubung. Periksa internet Anda.';
      // Normalisasi error agar mudah ditangani di UI
      const normalizedError = {
        ...error,
        isConnectivityError: true,
        userMessage,
        message: userMessage,
      };
      return Promise.reject(normalizedError);
    }

    return Promise.reject(error);
  }
);

export default api;
