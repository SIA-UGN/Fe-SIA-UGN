import api from './axios';

/**
 * ambil data profil user berdasarkan token yang tersimpan di cookie
 * @returns {Promise<*>} data user atau status gagal
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * ambil data profile staff
 * @returns {Promise<*>} data user atau status gagal
 */
export const getStaffProfile = async () => {
  try {
    const response = await api.get('/profile/staff');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * edit data profile staff
 * @param {Object} data data profile yang akan diubah
 * @returns {Promise<*>} data user atau status gagal
 */
export const updateStaffProfile = async (data) => {
  try {
    let payload = data;
    if (data && (data.profile_image instanceof File || data.profile_image instanceof Blob)) {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === 'profile_image') {
          if (value instanceof File || value instanceof Blob) {
            formData.append('profile_image', value);
          }
        } else {
          formData.append(key, value);
        }
      });

      payload = formData;
    }
    const response = await api.post('/profile/staff', payload);
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * ambil data profile umum mahasiswa
 * @returns {Promise<*>} data user atau status gagal
 */
export const getStudentProfile = async () => {
  try {
    const response = await api.get('/student/profile/identity');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * edit data profile umum mahasiswa
 * @param {Object} data data profile yang akan diubah
 * @returns {Promise<*>} data user atau status gagal
 */
export const updateStudentProfile = async (data) => {
  try {
    // If any field is a File/Blob, send as multipart/form-data (FormData)
    let payload = data;
    if (data && typeof data === 'object') {
      const hasBinary = Object.values(data).some(
        (v) => v instanceof File || v instanceof Blob
      );

      if (hasBinary) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
          } else {
            formData.append(key, value);
          }
        });
        payload = formData;
      }
    }

    const response = await api.post('/student/profile/identity', payload);
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * ambil data alamat mahasiswa
 * @returns {Promise<*>} data user atau status gagal
 */
export const getStudentAddress = async () => {
  try {
    const response = await api.get('/student/profile/address');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * edit data alamat mahasiswa
 * @param {Object} data data alamat yang akan diubah
 * @returns {Promise<*>} data user atau status gagal
 */
export const updateStudentAddress = async (data) => {
  try {
    const response = await api.post('/student/profile/address', data);
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * ambil data keluarga & pendidikan mahasiswa
 * @returns {Promise<*>} data user atau status gagal
 */
export const getStudentFamilyEducation = async () => {
  try {
    const response = await api.get('/student/profile/family-education');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * edit data keluarga & pendidikan mahasiswa
 * @param {Object} data data keluarga & pendidikan yang akan diubah
 * @returns {Promise<*>} data user atau status gagal
 */
export const updateStudentFamilyEducation = async (data) => {
  try {
    const response = await api.post('/student/profile/family-education', data);
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

/**
 * change password all users
 * @param {Object} data data password yang akan diubah
 * @returns {Promise<*>} data user atau status gagal
 */
export const changePassword = async (data) => {
  try {
    const response = await api.post('/profile/change-password', data);
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};
/**
 * Delete profile image of current user
 * @returns {Promise<*>} data user or failure status
 */
export const deleteProfileImage = async () => {
  try {
    const response = await api.delete('/profile/picture');
    return response.data;
  } catch (error) {
    throw (error.response?.data ?? error)
  }
};

export default {
    getProfile,
    getStaffProfile,
    updateStaffProfile,
    getStudentProfile,
    updateStudentProfile,
    getStudentAddress,
    updateStudentAddress,
    getStudentFamilyEducation,
    updateStudentFamilyEducation,
    changePassword,
    deleteProfileImage,
};