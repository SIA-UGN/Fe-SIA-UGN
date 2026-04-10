import api from '@/lib/axios';
import { getPrograms } from '@/lib/adminApi';
import { getProfile, getStaffProfile } from '@/lib/profileApi';
import {
  buildFormData,
  getProgramCandidatesFromPayload,
  mapProgramsToOptions,
  normalizeApiError,
  unwrapResponseData,
} from './common';
import type {
  Consultation,
  LecturerConsultationPayload,
  LecturerTopicPayload,
  ProgramOption,
  StudentThesisRequest,
  ThesisCategory,
  ThesisSupervisor,
  ThesisTopic,
} from '../types';

export const lecturerThesisApi = {
  async getTopics() {
    try {
      const response = await api.get('/lecturer/thesis/topics');
      return unwrapResponseData<ThesisTopic[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createTopic(payload: LecturerTopicPayload) {
    try {
      const response = await api.post('/lecturer/thesis/topics', payload);
      return unwrapResponseData<ThesisTopic>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getTopicDetail(id: number) {
    try {
      const response = await api.get(`/lecturer/thesis/topics/${id}`);
      return unwrapResponseData<ThesisTopic>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateTopic(id: number, payload: Partial<LecturerTopicPayload>) {
    try {
      const response = await api.put(`/lecturer/thesis/topics/${id}`, payload);
      return unwrapResponseData<ThesisTopic>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteTopic(id: number) {
    try {
      const response = await api.delete(`/lecturer/thesis/topics/${id}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async publishTopic(id: number) {
    try {
      const response = await api.patch(`/lecturer/thesis/topics/${id}/publish`);
      return unwrapResponseData<ThesisTopic>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async archiveTopic(id: number) {
    try {
      const response = await api.patch(`/lecturer/thesis/topics/${id}/archive`);
      return unwrapResponseData<ThesisTopic>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getRequests(status?: string) {
    try {
      const response = await api.get('/lecturer/thesis/requests', {
        params: status ? { status } : {},
      });
      return unwrapResponseData<StudentThesisRequest[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getRequestDetail(id: number) {
    try {
      const response = await api.get(`/lecturer/thesis/requests/${id}`);
      return unwrapResponseData<StudentThesisRequest>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async approveRequest(id: number) {
    try {
      const response = await api.patch(`/lecturer/thesis/requests/${id}/approve`);
      return unwrapResponseData<StudentThesisRequest>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async rejectRequest(id: number, rejectionNote: string) {
    try {
      const response = await api.patch(`/lecturer/thesis/requests/${id}/reject`, {
        rejection_note: rejectionNote,
      });
      return unwrapResponseData<StudentThesisRequest>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getSupervisees() {
    try {
      const response = await api.get('/lecturer/thesis/supervisees');
      return unwrapResponseData<ThesisSupervisor[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getConsultations(params: { status?: string; id_supervisor?: number } = {}) {
    try {
      const response = await api.get('/lecturer/thesis/consultations', { params });
      return unwrapResponseData<Consultation[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createConsultation(payload: LecturerConsultationPayload) {
    try {
      const response = await api.post(
        '/lecturer/thesis/consultations',
        buildFormData(payload),
      );
      return unwrapResponseData<Consultation>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getConsultationDetail(id: number) {
    try {
      const response = await api.get(`/lecturer/thesis/consultations/${id}`);
      return unwrapResponseData<Consultation>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateConsultation(id: number, payload: Partial<LecturerConsultationPayload>) {
    try {
      const response = await api.put(
        `/lecturer/thesis/consultations/${id}`,
        buildFormData(payload),
      );
      return unwrapResponseData<Consultation>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getCategories() {
    try {
      const response = await api.get('/lecturer/thesis/categories');
      return unwrapResponseData<ThesisCategory[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createCategory(payload: { name: string; description?: string }) {
    try {
      const response = await api.post('/lecturer/thesis/categories', payload);
      return unwrapResponseData<ThesisCategory>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getCategoryDetail(id: number) {
    try {
      const response = await api.get(`/lecturer/thesis/categories/${id}`);
      return unwrapResponseData<ThesisCategory>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateCategory(id: number, payload: { name?: string; description?: string }) {
    try {
      const response = await api.put(`/lecturer/thesis/categories/${id}`, payload);
      return unwrapResponseData<ThesisCategory>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteCategory(id: number) {
    try {
      const response = await api.delete(`/lecturer/thesis/categories/${id}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async resolveProgramOptions() {
    const candidates: ProgramOption[] = [];

    try {
      const response = await getPrograms();
      if (response?.status === 'success') {
        candidates.push(...mapProgramsToOptions(response.data));
      }
    } catch (_error) {
      // Fallback below.
    }

    if (candidates.length > 0) {
      return candidates;
    }

    try {
      const profile = await getProfile();
      if (profile?.data) {
        candidates.push(...getProgramCandidatesFromPayload(profile.data));
      }
    } catch (_error) {
      // Fallback below.
    }

    try {
      const staffProfile = await getStaffProfile();
      if (staffProfile?.data) {
        candidates.push(...getProgramCandidatesFromPayload(staffProfile.data));
      }
    } catch (_error) {
      // Ignore if unavailable.
    }

    const unique = new Map<number, ProgramOption>();
    candidates.forEach((item) => {
      if (!unique.has(item.id_program)) {
        unique.set(item.id_program, item);
      }
    });

    return Array.from(unique.values());
  },
};
