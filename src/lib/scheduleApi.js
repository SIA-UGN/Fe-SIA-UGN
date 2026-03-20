import api from './axios';

/**
 * Schedule API Module
 * Handles schedule-related API calls
 */

/**
 * Get schedules for authenticated user (student or lecturer)
 * @param {string} userRole - User role ('mahasiswa' | 'dosen')
 * @returns {Promise} - Schedule data
 */
export async function getMySchedules(userRole = 'mahasiswa') {
    try {
        const endpoint = userRole === 'dosen' ? '/lecturer/schedules' : '/student/schedules';
        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Get classes with full details (including schedules if available)
 * @param {string} userRole - User role ('mahasiswa' | 'dosen')
 * @returns {Promise} - Classes data
 */
export async function getMyClasses(userRole = 'mahasiswa') {
    try {
        const endpoint = userRole === 'dosen' ? '/lecturer/classes' : '/student/classes';
        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Format time from HH:mm:ss to HH:mm
 * @param {string} time - Time in HH:mm:ss format
 * @returns {string} - Formatted time HH:mm
 */
export function formatTime(time) {
    if (!time) return '';
    return time.substring(0, 5);
}

/**
 * Get day name in Indonesian
 * @param {number} dayIndex - Day index (0-6, 0 = Sunday)
 * @returns {string} - Day name in Indonesian
 */
export function getDayName(dayIndex) {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return dayNames[dayIndex] || '';
}

/**
 * Format date to Indonesian locale
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

export default {
    getMySchedules,
    getMyClasses,
    formatTime,
    getDayName,
    formatDate,
};
