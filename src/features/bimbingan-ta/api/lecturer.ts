import api from '@/lib/axios';
import { getPrograms } from '@/lib/adminApi';
import { getSubjects } from '@/lib/adminApi';
import { getProfile, getStaffProfile } from '@/lib/profileApi';
import {
  buildFormData,
  dedupeProgramOptions,
  getProgramCandidatesFromPayload,
  resolveProgramIdFromPayload,
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
      const profileData = profile?.data?.data || profile?.data || profile;
      if (profileData) {
        const resolvedId = resolveProgramIdFromPayload(profileData);
        if (resolvedId) {
          candidates.push({ id_program: resolvedId, name: profileData?.program?.name || `Program ${resolvedId}` });
        }
        candidates.push(...getProgramCandidatesFromPayload(profileData));
      }
    } catch (_error) {
      // Fallback below.
    }

    try {
      const staffProfile = await getStaffProfile();
      const staffProfileData = staffProfile?.data?.data || staffProfile?.data || staffProfile;
      if (staffProfileData) {
        const resolvedId = resolveProgramIdFromPayload(staffProfileData);
        if (resolvedId) {
          candidates.push({
            id_program: resolvedId,
            name: staffProfileData?.program?.name || `Program ${resolvedId}`,
          });
        }
        candidates.push(...getProgramCandidatesFromPayload(staffProfileData));
      }
    } catch (_error) {
      // Ignore if unavailable.
    }

    if (candidates.length === 0) {
      try {
        const topicsResponse = await api.get('/lecturer/thesis/topics');
        const topics = unwrapResponseData<any[]>(topicsResponse.data) || [];

        topics.forEach((topic) => {
          const idProgram = Number(topic?.id_program || topic?.program?.id_program || topic?.program?.id);
          const name = topic?.program?.name || topic?.program_name;
          if (Number.isFinite(idProgram) && name) {
            candidates.push({ id_program: idProgram, name });
          }
        });
      } catch (_error) {
        // Ignore if unavailable.
      }
    }

    return dedupeProgramOptions(candidates);
  },

  async getSubjects() {
    try {
      let normalizedFromManager: any[] = [];
      try {
        const response = await getSubjects();
        const rawList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
                ? response.data
                : [];

        normalizedFromManager = rawList
          .map((subject) => ({
            id_subject: Number(subject?.id_subject || subject?.id),
            name_subject: subject?.name_subject || subject?.name || '',
            code_subject: subject?.code_subject || subject?.code || null,
            sks: Number(subject?.sks || 0) || null,
          }))
          .filter((subject) => Number.isFinite(subject.id_subject) && subject.name_subject);
      } catch (_managerError) {
        // Ignored, proceed to fallback
      }

      if (normalizedFromManager.length > 0) {
        return normalizedFromManager;
      }

      try {
        const lecturerClassesResponse = await api.get('/lecturer/classes');
        const classList = Array.isArray(lecturerClassesResponse?.data?.data)
          ? lecturerClassesResponse.data.data
          : Array.isArray(lecturerClassesResponse?.data)
            ? lecturerClassesResponse.data
            : [];

        const extractedSubjects = classList
          .map((item) => item?.subject || item)
          .map((subject) => ({
            id_subject: Number(subject?.id_subject || subject?.id),
            name_subject: subject?.name_subject || subject?.name || '',
            code_subject: subject?.code_subject || subject?.code || null,
            sks: Number(subject?.sks || 0) || null,
          }))
          .filter((subject) => Number.isFinite(subject.id_subject) && subject.name_subject);

        const uniqueMap = new Map();
        extractedSubjects.forEach((subject) => {
          if (!uniqueMap.has(subject.id_subject)) {
            uniqueMap.set(subject.id_subject, subject);
          }
        });

        return Array.from(uniqueMap.values());
      } catch (_fallbackError) {
        return [];
      }
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createProgram(payload: { name: string }) {
    try {
      const response = await api.post('/manager/programs', payload);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
