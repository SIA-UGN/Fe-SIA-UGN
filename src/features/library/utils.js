export function getErrorMessage(error, fallbackMessage = 'Terjadi kesalahan, coba lagi.') {
  if (error?.userMessage) return error.userMessage;

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  const payloadMessage = error?.response?.data?.message || error?.message;
  if (typeof payloadMessage === 'string' && payloadMessage.trim()) {
    return payloadMessage;
  }

  const errors = error?.response?.data?.errors || error?.errors;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];

    if (Array.isArray(firstValue) && firstValue[0]) return firstValue[0];
    if (typeof firstValue === 'string' && firstValue.trim()) return firstValue;
  }

  return fallbackMessage;
}

export function parseApiBody(response) {
  if (!response) return null;
  if (response.data !== undefined) return response.data;
  return response;
}

export function parseListData(response) {
  const body = parseApiBody(response);

  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;

  if (Array.isArray(body?.data?.data)) return body.data.data;

  return [];
}

export function parsePaginatedData(response) {
  const body = parseApiBody(response);

  if (Array.isArray(body?.data)) {
    const meta = body.meta || body;
    const currentPage = Number(meta.current_page || 1);
    const perPage = Number(meta.per_page || body.data.length || 1);
    const total = Number(meta.total || body.data.length || 0);
    const lastPage = Number(meta.last_page || Math.max(1, Math.ceil(total / perPage)));

    return {
      data: body.data,
      meta: {
        current_page: Number.isFinite(currentPage) ? currentPage : 1,
        per_page: Number.isFinite(perPage) ? perPage : 1,
        total: Number.isFinite(total) ? total : body.data.length,
        last_page: Number.isFinite(lastPage) ? lastPage : 1,
      },
    };
  }

  if (Array.isArray(body?.data?.data)) {
    const raw = body.data;
    return {
      data: raw.data,
      meta: {
        current_page: Number(raw.current_page || 1),
        per_page: Number(raw.per_page || raw.data.length || 1),
        total: Number(raw.total || raw.data.length || 0),
        last_page: Number(raw.last_page || 1),
      },
    };
  }

  const list = parseListData(body);
  return {
    data: list,
    meta: {
      current_page: 1,
      per_page: list.length || 1,
      total: list.length,
      last_page: 1,
    },
  };
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ORDER_STATUS_LABELS = {
  ordered: 'Dipesan',
  borrowed: 'Dipinjam',
  returned: 'Dikembalikan',
  cancelled: 'Dibatalkan',
};

const SUGGESTION_STATUS_LABELS = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status || '-';
}

export function getSuggestionStatusLabel(status) {
  return SUGGESTION_STATUS_LABELS[status] || status || '-';
}
