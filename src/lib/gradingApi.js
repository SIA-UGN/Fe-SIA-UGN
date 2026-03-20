import api from "./axios";

/**
 * Semua fungsi terkait grading nilai
 */

/**
// ...existing code...

/**
 * Get academic periods/semesters
 * @returns {Promise} Response dengan data periode akademik
 */
export const getAcademicPeriods = async () => {
    try {
        const response = await api.get('/academic-periods');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get student grades by semester
 * @param {string} semesterId - ID semester/periode akademik (optional)
 * @returns {Promise} Response dengan data nilai mahasiswa
 */
export const getStudentGrades = async (semesterId = null) => {
    try {
        const params = {};
        if (semesterId) {
            params.id_academic_period = semesterId;
        }
        
        const response = await api.get(`/student/grades`, { params });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get student grade detail by class
 * @param {string} classId - ID kelas
 * @returns {Promise} Response dengan detail nilai mata kuliah
 */
export const getStudentGradeDetail = async (classId) => {
    try {
        const response = await api.get(`/student/classes/${classId}/grades`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Download transcript PDF
 * @param {string} academicPeriodId - ID periode akademik
 * @returns {Promise} Blob PDF file
 */
export const downloadTranscriptPDF = async (academicPeriodId) => {
    try {
        const response = await api.get(`/student/transcript/${academicPeriodId}/pdf`, {
            responseType: 'blob', // Important: untuk file download
        });
        return response;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get lecturer classes for grading (Dosen)
 * @param {string} academicPeriodId - ID periode akademik (optional)
 * @returns {Promise} Response dengan data kelas yang diajar
 */
export const getLecturerClassesForGrading = async (academicPeriodId = null) => {
    try {
        const params = {};
        if (academicPeriodId) {
            params.academic_period_id = academicPeriodId;
        }
        
        const response = await api.get('/lecturer/classes/grading', { params });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get class students with grades (Dosen)
 * @param {string} classId - ID kelas
 * @returns {Promise} Response dengan data mahasiswa dan nilai
 */
export const getClassStudentsWithGrades = async (classId) => {
    try {
        const response = await api.get(`/lecturer/classes/${classId}/students`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Save grades in bulk (Dosen)
 * @param {string} classId - ID kelas
 * @param {Array} grades - Array of {id_user_si, grade}
 * @returns {Promise} Response dengan hasil penyimpanan
 */
export const saveGradesBulk = async (classId, grades) => {
    try {
        const response = await api.post('/lecturer/grades/bulk', {
            id_class: classId,
            grades: grades
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};