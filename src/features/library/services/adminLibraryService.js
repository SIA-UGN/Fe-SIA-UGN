import api from '@/lib/axios';
import {
  AdminLibraryOrderDetailResponseSchema,
  AdminLibraryOrderListResponseSchema,
  AdminLibrarySuggestionDetailResponseSchema,
  AdminLibrarySuggestionListResponseSchema,
  ApiMetaSchema,
  normalizeAdminLibraryOrder,
  normalizeAdminLibrarySuggestion,
} from '@/features/library/contracts/adminLibraryContracts';

export const ADMIN_LIBRARY_QUERY_KEYS = {
  orders: (params = {}) => ['admin-library-orders', params],
  orderDetail: (orderId) => ['admin-library-order-detail', orderId],
  suggestions: (params = {}) => ['admin-library-suggestions', params],
  suggestionDetail: (suggestionId) => ['admin-library-suggestion-detail', suggestionId],
};

function buildParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') return acc;
    acc[key] = value;
    return acc;
  }, {});
}

export function toDomainError(error, fallbackMessage = 'Terjadi kesalahan.') {
  const status = error?.response?.status || null;
  const payload = error?.response?.data || null;
  const message =
    payload?.message ||
    error?.userMessage ||
    error?.message ||
    fallbackMessage;

  const validationErrors = payload?.errors && typeof payload.errors === 'object' ? payload.errors : null;

  return {
    status,
    message,
    validationErrors,
    code: error?.code || null,
    isConnectivityError: Boolean(error?.isConnectivityError || (!status && error?.message)),
    raw: error,
  };
}

function normalizeMeta(meta, fallbackLength = 0) {
  const parsed = ApiMetaSchema.safeParse(meta || {});
  if (parsed.success) return parsed.data;

  return {
    current_page: 1,
    last_page: 1,
    per_page: Math.max(fallbackLength, 1),
    total: fallbackLength,
  };
}

export async function fetchAdminLibraryOrders(params = {}) {
  try {
    const response = await api.get('/admin/library/orders', { params: buildParams(params) });
    const parsed = AdminLibraryOrderListResponseSchema.parse(response.data);
    const items = parsed.data.map(normalizeAdminLibraryOrder);

    return {
      items,
      meta: normalizeMeta(parsed.meta, items.length),
      message: parsed.message || 'Daftar pesanan berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil daftar pesanan perpustakaan.');
  }
}

export async function fetchAdminLibraryOrderDetail(orderId) {
  try {
    const response = await api.get(`/admin/library/orders/${orderId}`);
    const parsed = AdminLibraryOrderDetailResponseSchema.parse(response.data);

    return {
      item: normalizeAdminLibraryOrder(parsed.data),
      message: parsed.message || 'Detail pesanan berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil detail pesanan perpustakaan.');
  }
}

export async function confirmAdminLibraryBorrowAction(orderId, payload = {}) {
  try {
    const response = await api.patch(`/admin/library/orders/${orderId}/confirm-borrow`, payload);
    const parsed = AdminLibraryOrderDetailResponseSchema.parse(response.data);

    return {
      item: normalizeAdminLibraryOrder(parsed.data),
      message: parsed.message || 'Peminjaman berhasil dikonfirmasi.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengonfirmasi peminjaman.');
  }
}

export async function confirmAdminLibraryReturnAction(orderId, payload = {}) {
  try {
    const response = await api.patch(`/admin/library/orders/${orderId}/confirm-return`, payload);
    const parsed = AdminLibraryOrderDetailResponseSchema.parse(response.data);

    return {
      item: normalizeAdminLibraryOrder(parsed.data),
      message: parsed.message || 'Pengembalian berhasil dikonfirmasi.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengonfirmasi pengembalian.');
  }
}

export async function cancelAdminLibraryOrderAction(orderId, payload = {}) {
  try {
    const response = await api.patch(`/admin/library/orders/${orderId}/cancel`, payload);
    const parsed = AdminLibraryOrderDetailResponseSchema.parse(response.data);

    return {
      item: normalizeAdminLibraryOrder(parsed.data),
      message: parsed.message || 'Pesanan berhasil dibatalkan.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal membatalkan pesanan.');
  }
}

export async function fetchAdminLibrarySuggestions(params = {}) {
  try {
    const response = await api.get('/admin/library/suggestions', { params: buildParams(params) });
    const parsed = AdminLibrarySuggestionListResponseSchema.parse(response.data);
    const items = parsed.data.map(normalizeAdminLibrarySuggestion);

    return {
      items,
      meta: normalizeMeta(parsed.meta, items.length),
      message: parsed.message || 'Daftar usulan berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil daftar usulan buku.');
  }
}

export async function fetchAdminLibrarySuggestionDetail(suggestionId) {
  try {
    const response = await api.get(`/admin/library/suggestions/${suggestionId}`);
    const parsed = AdminLibrarySuggestionDetailResponseSchema.parse(response.data);

    return {
      item: normalizeAdminLibrarySuggestion(parsed.data),
      message: parsed.message || 'Detail usulan berhasil diambil.',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal mengambil detail usulan buku.');
  }
}

export async function respondAdminLibrarySuggestionAction(suggestionId, payload = {}) {
  try {
    const response = await api.patch(`/admin/library/suggestions/${suggestionId}/respond`, payload);
    const parsed = AdminLibrarySuggestionDetailResponseSchema.parse(response.data);

    return {
      item: normalizeAdminLibrarySuggestion(parsed.data),
      message: parsed.message || 'Respon usulan berhasil dikirim. ',
    };
  } catch (error) {
    throw toDomainError(error, 'Gagal merespons usulan buku.');
  }
}
