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
		console.log('error di sessionApi login:', error);
		// Lempar error ke pemanggil
		throw (error.response?.data ?? error);
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
