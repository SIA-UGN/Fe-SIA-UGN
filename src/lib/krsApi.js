import api from './axios';

function buildParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

function requestError(error) {
  throw (error.response?.data ?? error);
}

export const getStudentKrsQuota = async () => {
  try {
    const response = await api.get('/student/krs/quota');
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getStudentKrsAvailableClasses = async (params = {}) => {
  try {
    const response = await api.get('/student/krs/available-classes', {
      params: buildParams(params),
    });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const getStudentMyKrs = async (params = {}) => {
  try {
    const response = await api.get('/student/krs', {
      params: buildParams(params),
    });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const submitStudentKrs = async (idClass) => {
  try {
    const response = await api.post('/student/krs', {
      id_class: idClass,
    });
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

export const cancelStudentKrs = async (idKrs) => {
  try {
    const response = await api.delete(`/student/krs/${idKrs}`);
    return response.data;
  } catch (error) {
    requestError(error);
  }
};

const krsApi = {
  getStudentKrsQuota,
  getStudentKrsAvailableClasses,
  getStudentMyKrs,
  submitStudentKrs,
  cancelStudentKrs,
};

export default krsApi;