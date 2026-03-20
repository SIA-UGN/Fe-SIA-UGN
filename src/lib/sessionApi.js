import api from './axios';

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} Response data dari login
 */
export const login = async (email, password) => {
	try {
		const response = await api.post('/auth/login', { email, password });
		return response.data;
	} catch (error) {
		const logLevel = error.response?.status === 401 ? 'warn' : 'error';
		console[logLevel]('[sessionApi] login —', 'status:', error.response?.status, 'data:', JSON.stringify(error.response?.data), 'msg:', error.message);

		// If the server returned a JSON body with a usable message, throw it
		const serverData = error.response?.data;
		if (serverData && typeof serverData === 'object' && (serverData.message || serverData.error)) {
			throw serverData;
		}

		// Map common HTTP status codes to user-friendly messages
		const status = error.response?.status;
		if (status === 401) {
			throw { message: 'Email atau password salah.' };
		}
		if (status === 422) {
			throw { message: serverData?.message || 'Data yang dikirim tidak valid.' };
		}
		if (status === 429) {
			throw { message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' };
		}
		if (status >= 500) {
			throw { message: `Terjadi kesalahan pada server (${status}).` };
		}

		// Connectivity / timeout errors (already normalized by axios interceptor)
		if (error.userMessage || error.message) {
			throw { message: error.userMessage || error.message };
		}

		// Fallback
		throw { message: 'Mohon maaf, terjadi kesalahan saat login.' };
	}
};
export const logout = async () => {
	try {
		const response = await api.post('/auth/logout');
		return response.data;
	} catch (error) {
		// Lempar error ke pemanggil
		throw (error.response?.data ?? error);
	}
};

export default {
	login,
	logout,
};
