import api from "./axios";

/**
 * Class API Services
 * Semua endpoint khusus untuk Class Management
 */

/**
 * Get all classes
 * @returns {Promise} Response dengan data classes
 */
export const getAllClasses = async () => {
    try {
        const response = await api.get("manager/classes");
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/** 
 * Toggle status aktif/non-aktif kelas
 */
export const toggleClassStatus = async (classId) => {
    try {
        const response = await api.patch(`manager/classes/${classId}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error("Error toggling class status:", error);
        throw (error.response?.data ?? error);
    }
};

/**
 * Get teaching classes for lecturer
 * @param {string} academicPeriodId - Optional academic period filter
 * @returns {Promise} Response dengan data kelas yang diajar
 */
export const getTeachingClasses = async (academicPeriodId = null) => {
    try {
        const params = {};
        if (academicPeriodId) {
            params.academic_period_id = academicPeriodId;
        }
        const response = await api.get('lecturer/classes', { params });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get student classes (for mahasiswa role)
 * @param {string} academicPeriodId - Optional academic period filter
 * @returns {Promise} Response dengan data kelas mahasiswa
 */
export const getStudentClasses = async (academicPeriodId = null) => {
    try {
        const params = {};
        if (academicPeriodId) {
            params.academic_period_id = academicPeriodId;
        }
        const response = await api.get('student/classes', { params });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get class detail with students and lecturers
 * @param {number} classId - The class ID
 * @param {string} role - User role ('dosen' or 'mahasiswa')
 * @returns {Promise} Response dengan detail kelas, mahasiswa, dan dosen
 */
export const getClassDetail = async (classId, role = 'dosen') => {
    try {
        // Hit different endpoint based on role
        const endpoint = role === 'mahasiswa' 
            ? `student/classes/${classId}`
            : `lecturer/classes/${classId}`;
        
        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

export default {
    getAllClasses,
    getTeachingClasses,
    getStudentClasses,
    getClassDetail,
};