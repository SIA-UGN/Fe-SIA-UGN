import api from './axios';

const LOGIN_MAX_ATTEMPTS = 2;
const LOGIN_RETRY_DELAY_MS = 2500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const normalizeLoginMessage = (status, serverMessage) => {
	const message = String(serverMessage || '').toLowerCase();

	if (
		status === 404 ||
		message.includes('not found') ||
		message.includes('tidak ditemukan') ||
		message.includes('belum terdaftar') ||
		message.includes('account does not exist') ||
		message.includes('user does not exist')
	) {
		return 'Akun belum terdaftar.';
	}

	if (
		status === 401 ||
		message.includes('credentials are incorrect') ||
		message.includes('email atau password salah') ||
		message.includes('invalid credentials')
	) {
		return 'Email atau password salah.';
	}

	if (status === 422) {
		return serverMessage || 'Data yang dikirim tidak valid.';
	}

	if (status === 429) {
		return 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
	}

	if (status >= 500) {
		return `Terjadi kesalahan pada server (${status}).`;
	}

	return serverMessage;
};

const normalizeLoginError = (error) => {
	const serverData = error?.response?.data;
	const validationMessage = getFirstValidationMessage(serverData?.errors);
	const serverMessage =
		validationMessage ||
		serverData?.message ||
		serverData?.error;
	const status = error?.response?.status;
	const normalizedMessage = normalizeLoginMessage(status, serverMessage);

	if (serverData && typeof serverData === 'object' && normalizedMessage) {
		return { ...serverData, message: normalizedMessage, status };
	}

	if (normalizedMessage) {
		return { message: normalizedMessage, status };
	}

	if (error?.userMessage || error?.message) {
		return { message: error.userMessage || error.message, status };
	}

	return { message: 'Mohon maaf, terjadi kesalahan saat login.', status };
};

const logLoginError = (error, attempt, willRetry) => {
	const status = error?.response?.status ?? null;
	const payload = error?.response?.data ?? null;
	const message = error?.userMessage || error?.message || null;
	const isConnectivityError = Boolean(error?.isConnectivityError || error?.code === 'ECONNABORTED');
	const logLevel = status === 401 || isConnectivityError ? 'warn' : 'error';

	console[logLevel]('[sessionApi] login failed', {
		status,
		code: error?.code ?? null,
		message,
		data: payload,
		attempt,
		willRetry,
	});
};

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} Response data dari login
 */
export const login = async (email, password) => {
	let lastError;

	for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt += 1) {
		try {
			const response = await api.post('/auth/login', { email, password });
			return response.data;
		} catch (error) {
			lastError = error;
			const shouldRetry =
				attempt < LOGIN_MAX_ATTEMPTS &&
				Boolean(error?.isConnectivityError || error?.code === 'ECONNABORTED');

			logLoginError(error, attempt, shouldRetry);

			if (shouldRetry) {
				await sleep(LOGIN_RETRY_DELAY_MS);
				continue;
			}

			throw normalizeLoginError(error);
		}
	}

	throw normalizeLoginError(lastError);
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

const SessionApi = {
	login,
	logout,
};

export default SessionApi;
