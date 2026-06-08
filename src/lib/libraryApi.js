import api from './axios';

function buildParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') return acc;
    acc[key] = value;
    return acc;
  }, {});
}

function requestError(error) {
  throw (error.response?.data ?? error);
}

export const getLibraryBooks = async (params = {}) => {
  try {
    const response = await api.get('/library/books', { params: buildParams(params) });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getLibraryBookById = async (bookId) => {
  try {
    const response = await api.get(`/library/books/${bookId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getLibraryCategories = async () => {
  try {
    const response = await api.get('/library/categories');
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const orderLibraryBook = async (bookId) => {
  try {
    const response = await api.post(`/library/books/${bookId}/order`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getLibraryActivities = async (params = {}) => {
  try {
    const response = await api.get('/library/activities', { params: buildParams(params) });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getLibraryActivityById = async (activityId) => {
  try {
    const response = await api.get(`/library/activities/${activityId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const cancelLibraryActivity = async (activityId) => {
  try {
    const response = await api.patch(`/library/activities/${activityId}/cancel`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getLibrarySuggestions = async (params = {}) => {
  try {
    const response = await api.get('/library/suggestions', { params: buildParams(params) });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const createLibrarySuggestion = async (payload) => {
  try {
    const response = await api.post('/library/suggestions', payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibraryDashboard = async () => {
  try {
    const response = await api.get('/admin/library/dashboard');
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibraryCategories = async () => {
  try {
    const response = await api.get('/admin/library/categories');
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const createAdminLibraryCategory = async (payload) => {
  try {
    const response = await api.post('/admin/library/categories', payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const updateAdminLibraryCategory = async (categoryId, payload) => {
  try {
    const response = await api.put(`/admin/library/categories/${categoryId}`, payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const deleteAdminLibraryCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/admin/library/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibraryBooks = async (params = {}) => {
  try {
    const response = await api.get('/admin/library/books', { params: buildParams(params) });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const createAdminLibraryBook = async (payload) => {
  try {
    const response = await api.post('/admin/library/books', payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibraryBookById = async (bookId) => {
  try {
    const response = await api.get(`/admin/library/books/${bookId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const updateAdminLibraryBook = async (bookId, payload) => {
  try {
    const response = await api.put(`/admin/library/books/${bookId}`, payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const toggleAdminLibraryBookStatus = async (bookId) => {
  try {
    const response = await api.patch(`/admin/library/books/${bookId}/toggle-status`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const deleteAdminLibraryBook = async (bookId) => {
  try {
    const response = await api.delete(`/admin/library/books/${bookId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibraryOrders = async (params = {}) => {
  try {
    const response = await api.get('/admin/library/orders', { params: buildParams(params) });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibraryOrderById = async (orderId) => {
  try {
    const response = await api.get(`/admin/library/orders/${orderId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const confirmAdminLibraryBorrow = async (orderId, payload = {}) => {
  try {
    const response = await api.patch(`/admin/library/orders/${orderId}/confirm-borrow`, payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const confirmAdminLibraryReturn = async (orderId, payload = {}) => {
  try {
    const response = await api.patch(`/admin/library/orders/${orderId}/confirm-return`, payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const cancelAdminLibraryOrder = async (orderId, payload = {}) => {
  try {
    const response = await api.patch(`/admin/library/orders/${orderId}/cancel`, payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibrarySuggestions = async (params = {}) => {
  try {
    const response = await api.get('/admin/library/suggestions', { params: buildParams(params) });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getAdminLibrarySuggestionById = async (suggestionId) => {
  try {
    const response = await api.get(`/admin/library/suggestions/${suggestionId}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const respondAdminLibrarySuggestion = async (suggestionId, payload) => {
  try {
    const response = await api.patch(`/admin/library/suggestions/${suggestionId}/respond`, payload);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

const LibraryApi = {
  getLibraryBooks,
  getLibraryBookById,
  getLibraryCategories,
  orderLibraryBook,
  getLibraryActivities,
  getLibraryActivityById,
  cancelLibraryActivity,
  getLibrarySuggestions,
  createLibrarySuggestion,
  getAdminLibraryDashboard,
  getAdminLibraryCategories,
  createAdminLibraryCategory,
  updateAdminLibraryCategory,
  deleteAdminLibraryCategory,
  getAdminLibraryBooks,
  createAdminLibraryBook,
  getAdminLibraryBookById,
  updateAdminLibraryBook,
  toggleAdminLibraryBookStatus,
  deleteAdminLibraryBook,
  getAdminLibraryOrders,
  getAdminLibraryOrderById,
  confirmAdminLibraryBorrow,
  confirmAdminLibraryReturn,
  cancelAdminLibraryOrder,
  getAdminLibrarySuggestions,
  getAdminLibrarySuggestionById,
  respondAdminLibrarySuggestion,
};

export default LibraryApi;
