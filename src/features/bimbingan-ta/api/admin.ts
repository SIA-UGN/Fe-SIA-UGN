import api from '@/lib/axios';
import { normalizeApiError, unwrapPaginatedData, unwrapResponseData } from './common';
import type {
  Consultation,
  PaginatedResponse,
  StudentThesis,
  ThesisDashboardStats,
  ThesisSupervisor,
  ThesisTopic,
} from '../types';

export const adminThesisApi = {
  async getDashboard() {
    try {
      const response = await api.get('/admin/thesis/dashboard');
      return unwrapResponseData<ThesisDashboardStats>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getStudents(params: Record<string, any> = {}) {
    try {
      const response = await api.get('/admin/thesis/students', { params });
      return unwrapPaginatedData<StudentThesis>(response.data) as PaginatedResponse<StudentThesis>;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getStudentDetail(id: number) {
    try {
      const response = await api.get(`/admin/thesis/students/${id}`);
      return unwrapResponseData<StudentThesis>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getSupervisors(params: Record<string, any> = {}) {
    try {
      const response = await api.get('/admin/thesis/supervisors', { params });
      return unwrapResponseData<ThesisSupervisor[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getConsultations(params: Record<string, any> = {}) {
    try {
      const response = await api.get('/admin/thesis/consultations', { params });
      return unwrapPaginatedData<Consultation>(response.data) as PaginatedResponse<Consultation>;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getTopics(params: Record<string, any> = {}) {
    try {
      const response = await api.get('/admin/thesis/topics', { params });
      const payload = unwrapResponseData<ThesisTopic[] | PaginatedResponse<ThesisTopic>>(response.data);
      if (Array.isArray(payload)) {
        return payload;
      }
      return payload?.data || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
