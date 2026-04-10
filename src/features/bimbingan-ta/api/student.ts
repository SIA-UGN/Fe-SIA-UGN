import api from '@/lib/axios';
import { normalizeApiError, buildFormData, unwrapResponseData } from './common';
import type {
  Consultation,
  LecturerRequestPayload,
  StudentThesis,
  StudentThesisPayload,
  StudentThesisRequest,
  ThesisCategory,
  ThesisLecturer,
  ThesisSupervisor,
  ThesisTopic,
  TopicSelectionPayload,
} from '../types';

export const studentThesisApi = {
  async getCurrentThesis() {
    try {
      const response = await api.get('/student/thesis');
      return unwrapResponseData<StudentThesis | null>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createThesis(payload: StudentThesisPayload) {
    try {
      const response = await api.post('/student/thesis', buildFormData(payload));
      return unwrapResponseData<StudentThesis>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateThesis(id: number, payload: Partial<StudentThesisPayload>) {
    try {
      const response = await api.put(`/student/thesis/${id}`, buildFormData(payload));
      return unwrapResponseData<StudentThesis>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteThesis(id: number) {
    try {
      const response = await api.delete(`/student/thesis/${id}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getLecturers() {
    try {
      const response = await api.get('/student/thesis/lecturers');
      return unwrapResponseData<ThesisLecturer[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async requestLecturer(id: number, payload: LecturerRequestPayload) {
    try {
      const response = await api.post(`/student/thesis/${id}/request-lecturer`, payload);
      return unwrapResponseData<StudentThesisRequest>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getRequests() {
    try {
      const response = await api.get('/student/thesis/requests');
      return unwrapResponseData<StudentThesisRequest[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getTopics(myProgram = true) {
    try {
      const response = await api.get('/student/thesis/topics', {
        params: { my_program: myProgram },
      });
      return unwrapResponseData<ThesisTopic[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getTopicDetail(id: number) {
    try {
      const response = await api.get(`/student/thesis/topics/${id}`);
      return unwrapResponseData<ThesisTopic>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async selectTopic(topicId: number, payload: TopicSelectionPayload) {
    try {
      const response = await api.post(
        `/student/thesis/topics/${topicId}/select`,
        buildFormData(payload),
      );
      return unwrapResponseData<StudentThesis>(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getSupervisors() {
    try {
      const response = await api.get('/student/thesis/supervisors');
      return unwrapResponseData<ThesisSupervisor[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getConsultations(status?: string) {
    try {
      const response = await api.get('/student/thesis/consultations', {
        params: status ? { status } : {},
      });
      return unwrapResponseData<Consultation[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getCategories() {
    try {
      const response = await api.get('/student/thesis/categories');
      return unwrapResponseData<ThesisCategory[]>(response.data) || [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
