import api from './axios';

/**
 * Attendance API Module
 * Handles all attendance-related API calls
 */

// ========================================
// LECTURER ATTENDANCE APIS
// ========================================

/**
 * Get all classes for authenticated lecturer
 * @returns {Promise} - Classes data
 */
export async function getLecturerClasses(academicPeriodId = '') {
    try {
        const url = academicPeriodId 
            ? `/lecturer/attendance/classes?id_academic_period=${academicPeriodId}`
            : `/lecturer/attendance/classes`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Get class detail with schedules for attendance detail page
 * @param {number} classId - The class ID
 * @returns {Promise} - Class detail with schedules
 */
export const getClassSchedules = async (classId) => {
    try {
        const response = await api.get(`/lecturer/attendance/classes/${classId}/schedules`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get class detail with students and schedules for manual attendance input
 * @param {number} classId - The class ID
 * @returns {Promise} - Class detail data with students list
 */
export const getClassDetail = async (classId) => {
    try {
        const response = await api.get(`/lecturer/attendance/classes/${classId}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Open QR attendance session
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise} - QR session data
 */
export const openQRSession = async (scheduleId) => {
    try {
        console.log('[openQRSession] Making POST request to:', `/lecturer/schedules/${scheduleId}/open-qr`);
        const response = await api.post(`/lecturer/schedules/${scheduleId}/open-qr`);
        console.log('[openQRSession] Response received:', response);
        console.log('[openQRSession] Response data:', response.data);
        console.log('[openQRSession] Response status:', response.status);
        return response.data;
    } catch (error) {
        console.error('[openQRSession] Error occurred:', error);
        console.error('[openQRSession] Error response:', error.response);
        console.error('[openQRSession] Error message:', error.message);
        throw (error.response?.data ?? error);
    }
};

/**
 * Get active QR code for a schedule
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise} - Active QR data
 */
export const getActiveQR = async (scheduleId) => {
    try {
        const response = await api.get(`/lecturer/schedules/${scheduleId}/active-qr`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get attendance records for a schedule
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise} - Attendance records data
 */
export const getPresencesBySchedule = async (scheduleId) => {
    try {
        const response = await api.get(`/lecturer/schedules/${scheduleId}/presences`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Send manual attendance (lecturer marks students)
 * @param {number} scheduleId - The schedule ID
 * @param {Array} studentIds - Array of student IDs
 * @returns {Promise} - Success response
 */
export const sendManualAttendance = async (scheduleId, studentIds) => {
    try {
        const response = await api.post(`/lecturer/schedules/${scheduleId}/presences`, {
            student_ids: studentIds
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Delete attendance for a student
 * @param {number} scheduleId - The schedule ID
 * @param {number} studentId - The student ID
 * @returns {Promise} - Success response
 */
export const deletePresence = async (scheduleId, studentId) => {
    try {
        const response = await api.delete(`/lecturer/schedules/${scheduleId}/presences/${studentId}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Close attendance session
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise} - Success response
 */
export const closeAttendanceSession = async (scheduleId) => {
    try {
        const response = await api.put(`/lecturer/schedules/${scheduleId}/close-session`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

// ========================================
// STUDENT ATTENDANCE APIS
// ========================================

/**
 * Get student's classes for attendance page
 * @param {string} academicPeriodId - Optional academic period ID
 * @returns {Promise} - Student classes data for attendance
 */
export const getStudentClassesForAttendance = async (academicPeriodId = '') => {
    try {
        const url = academicPeriodId 
            ? `/student/attendance/classes?id_academic_period=${academicPeriodId}`
            : `/student/attendance/classes`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get student's attendance history by class
 * @param {string} classId - The class ID
 * @returns {Promise} - Student attendance history with statistics
 */
export const getStudentAttendanceHistoryByClass = async (classId) => {
    try {
        const response = await api.get(`/student/attendance/classes/${classId}/history`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get student's classes
 * @returns {Promise} - Student classes data
 */
export const getStudentClasses = async () => {
    try {
        const response = await api.get('/student/classes');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get student attendance history for a class
 * @param {number} studentId - The student ID
 * @param {number} classId - The class ID
 * @returns {Promise} - Attendance history data
 */
export const getAttendanceHistory = async (studentId, classId) => {
    try {
        const response = await api.get(`/student/${studentId}/classes/${classId}/attendances`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Scan QR code for attendance
 * @param {string} key - The QR code key
 * @param {number} studentId - The student ID
 * @returns {Promise} - Scan result
 */
export const scanQRAttendance = async (key, studentId) => {
    try {
        const response = await api.post('/student/attendances/scan', {
            key,
            id_student: studentId
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};
/**
 * Get active QR code for a schedule
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise} - Active QR data
 */
export const getStudentActiveQR = async (scheduleId) => {
    try {
        const response = await api.get(`/student/schedules/${scheduleId}/active-qr`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

// ========================================
// LECTURER GPS CHECK-IN API
// ========================================

/**
 * Check-in presensi dosen berbasis GPS
 * @param {number} latitude - Koordinat lintang dosen
 * @param {number} longitude - Koordinat bujur dosen
 * @param {number|null} id_schedule - ID jadwal (opsional)
 * @param {string|null} keterangan - Keterangan tambahan (opsional)
 * @returns {Promise} - Check-in result
 */
export const checkInDosenGPS = async (latitude, longitude, id_schedule = null, keterangan = null) => {
    try {
        const payload = { latitude, longitude };
        if (id_schedule) payload.id_schedule = id_schedule;
        if (keterangan) payload.keterangan = keterangan;

        const response = await api.post('/lecturer/attendance/check-in', payload);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

// ========================================
// ACADEMIC PERIODS API
// ========================================

/**
 * Get all academic periods
 * @returns {Promise} - Academic periods data
 */
export const getAcademicPeriods = async () => {
    try {
        const response = await api.get('/academic-periods');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};