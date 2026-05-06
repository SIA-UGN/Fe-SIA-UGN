import axiosInstance from '@/lib/axios';

export interface DashboardStats {
  hero: {
    total: number;
    approved: number;
    menunggu: number;
    ditolak: number;
  };
  grids: {
    pengajuanBaru: number;
    totalJudul: number;
    dosenAktif: number;
    mhsMonitoring: number;
  };
}

export interface RecentSubmission {
  id: string;
  name: string;
  nim: string;
  date: string;
  title: string;
  pembimbing: string | null;
  status: 'Menunggu Approval' | 'Approved' | 'Ditolak';
}

export interface AdminStudentsParams {
  status?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface AdminSupervisorsParams {
  search?: string;
  per_page?: number;
  page?: number;
  id_program?: number;
}

export interface AdminTopicsParams {
  search?: string;
  per_page?: number;
  page?: number;
  status?: string;
  id_program?: number;
}

export interface AdminStudentItem {
  id_student?: number;
  id_user_si?: number;
  name?: string;
  nim?: string;
  [key: string]: any;
}

export interface AdminStudentDetail extends AdminStudentItem {
  [key: string]: any;
}

export interface AdminSupervisorItem {
  id_supervisor?: number;
  id_lecturer?: number;
  name?: string;
  [key: string]: any;
}

export interface AdminTopicItem {
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

interface ApiListResponse<T> {
  status?: string;
  message?: string;
  data?: T[];
  items?: T[];
  meta?: Record<string, any>;
  [key: string]: any;
}

function extractList<T = any>(responseData: any): T[] {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData)) return responseData;
  return [];
}

const ADMIN_THESIS_BASE = '/api/admin/thesis';

export const adminBimbinganService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<DashboardStats>>(`${ADMIN_THESIS_BASE}/dashboard`);
      return data?.data ?? (data as unknown as DashboardStats);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async getStudents(params?: AdminStudentsParams): Promise<ApiListResponse<AdminStudentItem>> {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<AdminStudentItem>>(
        `${ADMIN_THESIS_BASE}/students`,
        { params },
      );
      return {
        ...data,
        data: extractList<AdminStudentItem>(data),
      };
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async getStudentDetail(id: number | string): Promise<AdminStudentDetail> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<AdminStudentDetail>>(`${ADMIN_THESIS_BASE}/students/${id}`);
      return data?.data ?? (data as unknown as AdminStudentDetail);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async getSupervisors(params?: AdminSupervisorsParams): Promise<ApiListResponse<AdminSupervisorItem>> {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<AdminSupervisorItem>>(
        `${ADMIN_THESIS_BASE}/supervisors`,
        { params },
      );
      return {
        ...data,
        data: extractList<AdminSupervisorItem>(data),
      };
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async getAllTopics(params?: AdminTopicsParams): Promise<ApiListResponse<AdminTopicItem>> {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<AdminTopicItem>>(
        `${ADMIN_THESIS_BASE}/topics`,
        { params },
      );
      return {
        ...data,
        data: extractList<AdminTopicItem>(data),
      };
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },
};

export const getDashboardStats = adminBimbinganService.getDashboardStats;
