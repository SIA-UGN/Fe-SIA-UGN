import axiosInstance from '@/lib/axios';

export interface StudentThesisResponse {
  [key: string]: any;
}

export interface StudentLecturerItem {
  id_user_si?: number;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface StudentTopicItem {
  id_thesis_topic?: number;
  topic?: string;
  title_ind?: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

function getFallbackPaths(path: string): string[] {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const baseURL = String(axiosInstance.defaults.baseURL ?? '').toLowerCase();
  const baseHasApiSuffix = /\/api\/?$/.test(baseURL);

  if (baseHasApiSuffix) {
    if (normalized.startsWith('/api/')) {
      return [normalized.slice(4) || '/'];
    }
    return [normalized];
  }

  if (normalized.startsWith('/api/')) {
    return [normalized, normalized.slice(4) || '/'];
  }

  return [`/api${normalized}`, normalized];
}

async function getWithRouteFallback<T = any>(path: string, config?: any): Promise<T> {
  let lastError: any;
  for (const currentPath of getFallbackPaths(path)) {
    try {
      const { data } = await axiosInstance.get<T>(currentPath, config);
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function postWithRouteFallback<T = any>(path: string, body?: any, config?: any): Promise<T> {
  let lastError: any;
  for (const currentPath of getFallbackPaths(path)) {
    try {
      const { data } = await axiosInstance.post<T>(currentPath, body, config);
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function deleteWithRouteFallback<T = any>(path: string, config?: any): Promise<T> {
  let lastError: any;
  for (const currentPath of getFallbackPaths(path)) {
    try {
      const { data } = await axiosInstance.delete<T>(currentPath, config);
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function extractList<T = any>(responseData: any): T[] {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData)) return responseData;
  return [];
}

export function extract422Message(err: any): string | null {
  if (err?.response?.status !== 422) return null;

  const errorsObj = err?.response?.data?.errors;
  if (errorsObj && typeof errorsObj === 'object') {
    const firstKey = Object.keys(errorsObj)[0];
    const firstMsg = Array.isArray(errorsObj[firstKey])
      ? errorsObj[firstKey][0]
      : errorsObj[firstKey];
    return `${firstKey}: ${firstMsg}`;
  }

  return err?.response?.data?.message ?? 'Data tidak valid (422).';
}

const STUDENT_THESIS_BASE = '/api/student/thesis';

export const studentTaService = {
  async getOwnThesis(): Promise<StudentThesisResponse | null> {
    try {
      const data = await getWithRouteFallback<ApiResponse<StudentThesisResponse | null>>(STUDENT_THESIS_BASE);
      return data?.data ?? null;
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createThesis(formData: FormData): Promise<StudentThesisResponse> {
    try {
      const data = await postWithRouteFallback<ApiResponse<StudentThesisResponse>>(
        STUDENT_THESIS_BASE,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return data?.data ?? (data as unknown as StudentThesisResponse);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async getLecturers(): Promise<StudentLecturerItem[]> {
    try {
      const data = await getWithRouteFallback<ApiResponse<any> | any>(`${STUDENT_THESIS_BASE}/lecturers`);
      return extractList<StudentLecturerItem>(data);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  async requestLecturer(thesisId: number, lecturerId: number, note?: string): Promise<any> {
    try {
      const data = await postWithRouteFallback<ApiResponse<any>>(
        `${STUDENT_THESIS_BASE}/${thesisId}/request-lecturer`,
        {
          id_lecturer: lecturerId,
          student_note: note ?? '',
        },
      );

      return data?.data ?? data;
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async getAvailableTopics(myProgramOnly = true): Promise<StudentTopicItem[]> {
    try {
      const data = await getWithRouteFallback<ApiResponse<any> | any>(`${STUDENT_THESIS_BASE}/topics`, {
        params: {
          my_program: myProgramOnly,
        },
      });
      return extractList<StudentTopicItem>(data);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  async selectTopic(topicId: number, formData: FormData): Promise<StudentThesisResponse> {
    try {
      const data = await postWithRouteFallback<ApiResponse<StudentThesisResponse>>(
        `${STUDENT_THESIS_BASE}/topics/${topicId}/select`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return data?.data ?? (data as unknown as StudentThesisResponse);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async deleteThesis(id: number): Promise<void> {
    try {
      await deleteWithRouteFallback(`${STUDENT_THESIS_BASE}/${id}`);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },
};
