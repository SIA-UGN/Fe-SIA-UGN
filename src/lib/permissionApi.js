import api from "./axios";

/**
 * permissionApi.js
 * Semua fungsi terkait permission API
 */

/**
 * Get permission for a specific class
 * @param {string} classId - ID of the class
 * @returns {Promise} Response dengan data permission
 */
export const getPermissionForAClass = async (classId) => {
    try {
        const response = await api.get(`lecturer/classes/${classId}/permission`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};
/**
 * Get permission for a specific class for student
 * @param {string} classId - ID of the class
 * @returns {Promise} Response dengan data permission
 */
export const getStudentPermissionForAClass = async (classId) => {
    try {
        const response = await api.get(`student/classes/${classId}/permission`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};
/**
 * Get permission for a specific schedule in a class
 * @param {string} classId - ID of the class
 * @param {string} scheduleId - ID of the schedule
 * @returns {Promise} Response dengan data permission
 */
export const getPermissionForAScheduleInAClass = async (classId, scheduleId) => {
    try {
        const response = await api.get(`lecturer/classes/${classId}/schedules/${scheduleId}/validate`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};