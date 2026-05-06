import api from './axios';

/**
 * Admin API Services
 * Semua endpoint khusus untuk Admin Dashboard
 */

const FALLBACK_ROUTE_STATUSES = new Set([404, 405]);

const extractValidationMessage = (payload) => {
  if (!payload || typeof payload !== 'object' || !payload.errors || typeof payload.errors !== 'object') {
    return null;
  }

  const firstField = Object.keys(payload.errors)[0];
  if (!firstField) {
    return null;
  }

  const firstValue = payload.errors[firstField];
  const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue;

  if (!firstMessage) {
    return null;
  }

  return `${firstField}: ${firstMessage}`;
};

const normalizeApiError = (error, fallbackMessage) => {
  const payload = error?.response?.data;
  const message =
    extractValidationMessage(payload) ||
    payload?.message ||
    payload?.error ||
    error?.userMessage ||
    error?.message ||
    fallbackMessage;

  if (payload && typeof payload === 'object') {
    return { ...payload, message };
  }

  return { message, status: error?.response?.status };
};

const findEntityId = (item) =>
  Number(
    item?.id_user_si ??
    item?.id_manager ??
    item?.id_student ??
    item?.id_lecturer ??
    item?.id ??
    0
  );

const buildUnsupportedUpdateError = (entityName, lastError) => ({
  message: `Backend deployed belum menyediakan endpoint update ${entityName}.`,
  status: lastError?.response?.status,
});

const requestCandidates = async (candidates, fallbackMessage, unsupportedMessage = fallbackMessage) => {
  let lastError;

  for (const candidate of candidates) {
    try {
      const response = await api.request(candidate);
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;

      if (FALLBACK_ROUTE_STATUSES.has(status)) {
        continue;
      }

      throw normalizeApiError(error, fallbackMessage);
    }
  }

  throw normalizeApiError(lastError, unsupportedMessage);
};

const getEntityFromList = async ({ fetcher, id, entityName }) => {
  try {
    const response = await fetcher();

    if (response?.status !== 'success' || !Array.isArray(response?.data)) {
      throw { message: `Gagal mengambil data ${entityName}.` };
    }

    const selected = response.data.find((item) => String(findEntityId(item)) === String(id));

    if (!selected) {
      throw { message: `Data ${entityName} tidak ditemukan.` };
    }

    return {
      status: 'success',
      data: selected,
    };
  } catch (error) {
    throw normalizeApiError(error, `Gagal mengambil data ${entityName}.`);
  }
};

/**
 * Get dashboard statistics (Total Mata Kuliah, Mahasiswa, Dosen, Kelas)
 * @returns {Promise} Response dengan data statistik
 */
export const getDashboardStatistics = async () => {
  try {
    const response = await api.get('/manager/statistics');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error);
  }
};

/**
 * Get detailed statistics (untuk data lebih lengkap - optional)
 * @returns {Promise} Response dengan data statistik detail
 */
export const getDetailedStatistics = async () => {
  try {
    const response = await api.get('/manager/statistics/detailed');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error);
  }
};

/**
 * Get all programs
 * @returns {Promise} Response dengan data programs
 */
export const getPrograms = async () => {
  try {
    const response = await api.get('/manager/programs');
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data program.');
  }
};

/**
 * Store new program
 * @param {Object} programData - Data program studi baru
 * @returns {Promise} Response hasil create
 */
export const storeProgram = async (programData) => {
  try {
    const response = await api.post('/manager/programs', programData);
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error);
  }
};

/**
 * Get all subjects
 * @returns {Promise} Response dengan data subjects
 */
export const getSubjects = async () => {
  try {
    const response = await api.get('/manager/subjects');
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data mata kuliah.');
  }
};
/**
 * Store new subject
 * @param {Object} subjectData - Data mata kuliah baru
 * @returns {Promise} Response hasil create
 */
export const storeSubject = async (subjectData) => {
  try {
    const response = await api.post('/manager/subjects', subjectData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan mata kuliah.');
  }
};

/**
 * Ambil detail matkul dari id untuk load data ke form edit
 * @param {number} subjectId - id matkul
 * @returns {Promise} Response dengan data subject
 */
export const getSubjectById = async (subjectId) => {
  try {
    const response = await api.get(`/manager/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil detail mata kuliah.');
  }
};

/**
 * Update matkul yang ada
 * @param {number} subjectId - id matkul yang akan diupdate
 * @param {Object} subjectData - Data matkul yang diupdate
 * @returns {Promise} Response hasil update
 */
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await api.put(`/manager/subjects/${subjectId}`, subjectData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal memperbarui mata kuliah.');
  }
};
/**
 * Delete matkul yang ada
 * @param {number} subjectId - id matkul yang akan dihapus
 * @returns {Promise} Response hasil delete
 */
export const deleteSubject = async (subjectId) => {
  try {
    const response = await api.delete(`/manager/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menghapus mata kuliah.');
  }
};

/**
 * Get all classes
 * @returns {Promise} Response dengan data kelas
 */
export const getClasses = async () => {
  try {
    const response = await api.get('/manager/classes');
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data kelas.');
  }
};

/**
 * Store new class
 * @param {Object} classData - Data kelas baru
 * @returns {Promise} Response hasil create
 */
export const storeClass = async (classData) => {
  try {
    const response = await api.post('/manager/classes', classData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan kelas.');
  }
};

/**
 * Get detail class by ID
 * @param {number} classId - ID kelas
 * @returns {Promise} Response dengan data kelas
 */
export const getClassById = async (classId) => {
  try {
    const response = await api.get(`/manager/classes/${classId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil detail kelas.');
  }
};

/**
 * Update class by ID
 * @param {number} classId - ID kelas
 * @param {Object} classData - Data kelas yang diupdate
 * @returns {Promise} Response hasil update
 */
export const updateClass = async (classId, classData) => {
  try {
    const response = await api.put(`/manager/classes/${classId}`, classData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal memperbarui kelas.');
  }
};

/**
 * Assign lecturers to class
 * @param {number} classId - ID kelas
 * @param {Array} lecturerIds - Array of lecturer IDs to assign
 * @returns {Promise} Response hasil assign
 */
export const assignLecturersToClass = async (classId, lecturerIds) => {
  try {
    const response = await api.post(`/manager/classes/${classId}/lecturers`, lecturerIds);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan dosen ke kelas.');
  }
};

/**
 * Assign students to class
 * @param {number} classId - ID kelas
 * @param {Array} studentIds - Array of student IDs to assign
 * @returns {Promise} Response hasil assign
 */
export const assignStudentsToClass = async (classId, studentIds) => {
  try {
    const response = await api.post(`/manager/classes/${classId}/students`, studentIds);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan mahasiswa ke kelas.');
  }
};

/**
 * Remove lecturer from class
 * @param {number} classId - ID kelas
 * @param {number} lecturerId - ID dosen yang akan dihapus dari kelas
 * @returns {Promise} Response hasil remove
 */
export const removeLecturerFromClass = async (classId, lecturerId) => {
  try {
    const response = await api.delete(`/manager/classes/${classId}/lecturers/${lecturerId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menghapus dosen dari kelas.');
  }
};

/**
 * Remove student from class
 * @param {number} classId - ID kelas
 * @param {number} studentId - ID mahasiswa yang akan dihapus dari kelas
 * @returns {Promise} Response hasil remove
 */
export const removeStudentFromClass = async (classId, studentId) => {
  try {
    const response = await api.delete(`/manager/classes/${classId}/students/${studentId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menghapus mahasiswa dari kelas.');
  }
};

/**
 * Generate schedule for a class
 * @param {number} classId - ID kelas
 * @param {Object} scheduleData - Data jadwal yang akan dibuat
 * @returns {Promise} Response hasil generate
 */
export const generateSchedule = async (classId, scheduleData) => {
  try {
    const response = await api.post(`/manager/classes/${classId}/generate-schedule`, scheduleData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal membuat jadwal kelas.');
  }
};

/**
 * Get all managers
 * @returns {Promise} Response dengan data managers
 */
export const getManagers = async () => {
  try {
    const response = await api.get('/admin/managers');
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data manager.');
  }
};

export const getManagerById = async (managerId) =>
  getEntityFromList({
    fetcher: getManagers,
    id: managerId,
    entityName: 'manager',
  });

export const updateManager = async (managerId, managerData) => {
  try {
    return await requestCandidates(
      [
        { method: 'put', url: `/admin/managers/${managerId}`, data: managerData },
        { method: 'patch', url: `/admin/managers/${managerId}`, data: managerData },
        {
          method: 'post',
          url: `/admin/managers/${managerId}`,
          data: { ...managerData, _method: 'PUT' },
        },
      ],
      'Gagal memperbarui data manager.',
      'Backend deployed belum menyediakan endpoint update manager.',
    );
  } catch (error) {
    if (error?.status && FALLBACK_ROUTE_STATUSES.has(error.status)) {
      throw buildUnsupportedUpdateError('manager', error);
    }

    throw error;
  }
};

/**
 * Create new manager
 * @param {Object} managerData - Data manager baru
 * @returns {Promise} Response hasil create
 */
export const storeManager = async (managerData) => {
  try {
    const response = await api.post('/admin/managers', managerData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan manager.');
  }
};

/**
 * Delete manager
 * @param {number} managerId - ID manager yang akan dihapus
 * @returns {Promise} Response hasil delete
 */
export const deleteManager = async (managerId) => {
  try {
    const response = await api.delete(`/admin/managers/${managerId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menghapus manager.');
  }
};
/**
 * Get all dosen
 * @returns {Promise} Response dengan data dosen
 */
export const getDosen = async () => {
  try {
    return await requestCandidates(
      [
        { method: 'get', url: '/manager/lecturers' },
        { method: 'get', url: '/manager/users-by-role', params: { role: 'dosen' } },
      ],
      'Gagal mengambil data dosen.',
    );
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data dosen.');
  }
};

export const getDosenById = async (dosenId) =>
  getEntityFromList({
    fetcher: getDosen,
    id: dosenId,
    entityName: 'dosen',
  });

export const updateDosen = async (dosenId, dosenData) => {
  try {
    return await requestCandidates(
      [
        { method: 'put', url: `/manager/lecturers/${dosenId}`, data: dosenData },
        { method: 'patch', url: `/manager/lecturers/${dosenId}`, data: dosenData },
        {
          method: 'post',
          url: `/manager/lecturers/${dosenId}`,
          data: { ...dosenData, _method: 'PUT' },
        },
      ],
      'Gagal memperbarui data dosen.',
      'Backend deployed belum menyediakan endpoint update dosen.',
    );
  } catch (error) {
    if (error?.status && FALLBACK_ROUTE_STATUSES.has(error.status)) {
      throw buildUnsupportedUpdateError('dosen', error);
    }

    throw error;
  }
};
/**
 * Tambah dosen baru
 * @param {Object} dosenData - Data dosen baru
 * @returns {Promise} Response hasil create
 */
export const storeDosen = async (dosenData) => {
  try {
    const response = await api.post('/manager/lecturers', dosenData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan dosen.');
  }
};

/**
 * Get all mahasiswa
 * @returns {Promise} Response dengan data mahasiswa
 */
export const getMahasiswa = async () => {
  try {
    return await requestCandidates(
      [
        { method: 'get', url: '/manager/students' },
        { method: 'get', url: '/manager/users-by-role', params: { role: 'mahasiswa' } },
      ],
      'Gagal mengambil data mahasiswa.',
    );
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data mahasiswa.');
  }
};

export const getMahasiswaById = async (studentId) =>
  getEntityFromList({
    fetcher: getMahasiswa,
    id: studentId,
    entityName: 'mahasiswa',
  });

export const updateMahasiswa = async (studentId, mahasiswaData) => {
  try {
    return await requestCandidates(
      [
        { method: 'put', url: `/manager/students/${studentId}`, data: mahasiswaData },
        { method: 'patch', url: `/manager/students/${studentId}`, data: mahasiswaData },
        {
          method: 'post',
          url: `/manager/students/${studentId}`,
          data: { ...mahasiswaData, _method: 'PUT' },
        },
      ],
      'Gagal memperbarui data mahasiswa.',
      'Backend deployed belum menyediakan endpoint update mahasiswa.',
    );
  } catch (error) {
    if (error?.status && FALLBACK_ROUTE_STATUSES.has(error.status)) {
      throw buildUnsupportedUpdateError('mahasiswa', error);
    }

    throw error;
  }
};
/**
 * Store mahasiswa baru
 * @param {Object} mahasiswaData - Data mahasiswa baru
 * @returns {Promise} Response hasil create
 */
export const storeMahasiswa = async (mahasiswaData) => {
  try {
    const response = await api.post('/manager/students', mahasiswaData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan mahasiswa.');
  }
};

/**
 * Ubah status aktif/non-aktif user (Mahasiswa/Dosen)
 * Dapat diakses oleh Admin dan Manager
 * @param {number} userId - ID user yang akan diubah statusnya
 * @returns {Promise} Response hasil update
 */
export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.patch(`/manager/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw normalizeApiError(error, 'Gagal mengubah status user.');
  }
};

/**
 * Ubah status aktif/non-aktif manager
 * Hanya dapat diakses oleh Admin
 * @param {number} managerId - ID manager yang akan diubah statusnya
 * @returns {Promise} Response hasil update
 */
export const toggleManagerStatus = async (managerId) => {
  try {
    const response = await api.patch(`/admin/managers/${managerId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error toggling manager status:", error);
    throw normalizeApiError(error, 'Gagal mengubah status manager.');
  }
};

export const toggleClassStatus = async (classId) => {
  try {
    const response = await api.patch(`/manager/classes/${classId}/toggle-status`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengubah status kelas.');
  }
};

/**
 * Get all academic periods
 * @returns {Promise} Response dengan data academic periods
 */
export const getAcademicPeriods = async () => {
  try {
    const response = await api.get('/academic-periods');
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil data periode akademik.');
  }
};

/**
 * Create new academic period
 * @param {Object} periodData - Data academic period baru
 * @returns {Promise} Response hasil create
 */
export const storeAcademicPeriod = async (periodData) => {
  try {
    const response = await api.post('/academic-periods', periodData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menambahkan periode akademik.');
  }
};

/**
 * Delete academic period by ID
 * @param {number} periodId - ID academic period yang akan dihapus
 * @returns {Promise} Response hasil delete
 */
export const deleteAcademicPeriod = async (periodId) => {
  try {
    const response = await api.delete(`/academic-periods/${periodId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal menghapus periode akademik.');
  }
};

/**
 * Get academic period by ID
 * @param {number} periodId - ID academic period
 * @returns {Promise} Response dengan data academic period
 */
export const getAcademicPeriodById = async (periodId) => {
  try {
    const response = await api.get(`/academic-periods/${periodId}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengambil detail periode akademik.');
  }
};

/**
 * Update academic period by ID
 * @param {number} periodId - ID academic period
 * @param {Object} periodData - Data academic period yang diupdate
 */
export const updateAcademicPeriod = async (periodId, periodData) => {
  try {
    const response = await api.put(`/academic-periods/${periodId}`, periodData);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal memperbarui periode akademik.');
  }
};

/**
 * Toggle status aktif/non-aktif academic period
 * @param {number} periodId - ID academic period yang akan diubah statusnya
 * @param {object} data - Data yang diaktifkan
 * @returns {Promise} Response hasil update
 */
export const toggleAcademicPeriodStatus = async (periodId, data) => {
  try {
    const response = await api.put(`/academic-periods/${periodId}/toggle-status`, data);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, 'Gagal mengubah status periode akademik.');
  }
};

const adminApi = {
  getDashboardStatistics,
  getDetailedStatistics,
  getPrograms,
  getManagers,
  getManagerById,
  storeManager,
  updateManager,
  deleteManager,
  getSubjects,
  storeSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getClasses,
  toggleClassStatus,
  getDosen,
  getDosenById,
  storeDosen,
  updateDosen,
  getMahasiswa,
  getMahasiswaById,
  storeMahasiswa,
  updateMahasiswa,
  toggleUserStatus,
  toggleManagerStatus,
  storeClass,
  getClassById,
  updateClass,
  assignLecturersToClass,
  assignStudentsToClass,
  removeLecturerFromClass,
  removeStudentFromClass,
  generateSchedule,
  getAcademicPeriods,
  storeAcademicPeriod,
  deleteAcademicPeriod,
  getAcademicPeriodById,
  updateAcademicPeriod,
  toggleAcademicPeriodStatus,
};

export default adminApi;
