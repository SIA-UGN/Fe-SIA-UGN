import axiosInstance from '@/lib/axios';
import type { CorrespondencePayload, Category, Recipient } from '@/types/correspondence.d';
import {
    CategoryDetailResponseSchema,
    CategoryListResponseSchema,
    CorrespondenceDetailResponseSchema,
    CorrespondenceListResponseSchema,
    RecipientDetailResponseSchema,
    RecipientListResponseSchema,
    normalizeCorrespondence,
} from '@/features/persuratan/contracts/correspondenceContracts';

export function toDomainError(error: any, fallbackMessage = 'Terjadi kesalahan.') {
    const status = error?.response?.status || null;
    const payload = error?.response?.data || null;
    const message =
        payload?.message ||
        error?.userMessage ||
        error?.message ||
        fallbackMessage;

    const validationErrors = payload?.errors && typeof payload.errors === 'object' ? payload.errors : null;

    return {
        status,
        message,
        validationErrors,
        code: error?.code || null,
        isConnectivityError: Boolean(error?.isConnectivityError || (!status && error?.message)),
        raw: error,
    };
}

function buildParams(params: Record<string, any> = {}) {
    return Object.entries(params).reduce<Record<string, any>>((acc, [key, value]) => {
        if (value === undefined || value === null || value === '') return acc;
        acc[key] = value;
        return acc;
    }, {});
}

function buildCorrespondenceFormData(payload: CorrespondencePayload & { attachment?: File }) {
    const formData = new FormData();
    formData.append('id_category', String(payload.id_category));
    formData.append('id_recipient', String(payload.id_recipient));
    formData.append('title', payload.title);
    formData.append('correspondence_body', payload.correspondence_body);
    if (payload.attachment) {
        formData.append('attachment', payload.attachment);
    }
    return formData;
}

export const correspondenceService = {
    // --- PUBLIC / STUDENT / LECTURER ---
    getAll: async (params: Record<string, any> = {}) => {
        try {
            const { data } = await axiosInstance.get('/correspondence', { params: buildParams(params) });
            const parsed = CorrespondenceListResponseSchema.parse(data);
            return parsed.data.map(normalizeCorrespondence);
        } catch (error) {
            throw toDomainError(error, 'Gagal memuat data persuratan.');
        }
    },

    getDetail: async (id: number) => {
        try {
            const { data } = await axiosInstance.get(`/correspondence/${id}`);
            const parsed = CorrespondenceDetailResponseSchema.parse(data);
            return normalizeCorrespondence(parsed.data);
        } catch (error) {
            throw toDomainError(error, 'Gagal memuat detail surat.');
        }
    },

    create: async (payload: CorrespondencePayload) => {
        try {
            const formData = buildCorrespondenceFormData(payload);
            const { data } = await axiosInstance.post('/correspondence', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const parsed = CorrespondenceDetailResponseSchema.parse(data);
            return normalizeCorrespondence(parsed.data);
        } catch (error) {
            throw toDomainError(error, 'Gagal mengirim surat.');
        }
    },

    update: async (id: number, payload: CorrespondencePayload) => {
        try {
            const formData = buildCorrespondenceFormData(payload);
            formData.append('_method', 'PATCH');
            const { data } = await axiosInstance.post(`/correspondence/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const parsed = CorrespondenceDetailResponseSchema.parse(data);
            return normalizeCorrespondence(parsed.data);
        } catch (error) {
            throw toDomainError(error, 'Gagal memperbarui surat.');
        }
    },

    delete: async (id: number) => {
        try {
            const { data } = await axiosInstance.delete(`/correspondence/${id}`);
            return data;
        } catch (error) {
            throw toDomainError(error, 'Gagal menghapus surat.');
        }
    },

    deleteAttachment: async (id: number) => {
        try {
            const { data } = await axiosInstance.delete(`/correspondence/${id}/attachment`);
            return data;
        } catch (error) {
            throw toDomainError(error, 'Gagal menghapus lampiran.');
        }
    },

    // --- MASTER DATA (Categories & Recipients) ---
    getCategories: async (): Promise<Category[]> => {
        try {
            const { data } = await axiosInstance.get('/correspondence/categories');
            const parsed = CategoryListResponseSchema.parse(data);
            return parsed.data as Category[];
        } catch (error) {
            throw toDomainError(error, 'Gagal memuat kategori persuratan.');
        }
    },

    getCategoryDetail: async (id: number): Promise<Category> => {
        try {
            const { data } = await axiosInstance.get(`/correspondence/categories/${id}`);
            const parsed = CategoryDetailResponseSchema.parse(data);
            return parsed.data as Category;
        } catch (error) {
            throw toDomainError(error, 'Gagal memuat detail kategori.');
        }
    },

    getRecipients: async (): Promise<Recipient[]> => {
        try {
            const { data } = await axiosInstance.get('/correspondence/recipients');
            const parsed = RecipientListResponseSchema.parse(data);
            return parsed.data as Recipient[];
        } catch (error) {
            throw toDomainError(error, 'Gagal memuat penerima persuratan.');
        }
    },

    getRecipientDetail: async (id: number): Promise<Recipient> => {
        try {
            const { data } = await axiosInstance.get(`/correspondence/recipients/${id}`);
            const parsed = RecipientDetailResponseSchema.parse(data);
            return parsed.data as Recipient;
        } catch (error) {
            throw toDomainError(error, 'Gagal memuat detail penerima.');
        }
    },

    // --- ADMIN / MANAGER ONLY ---
    respond: async (id: number, payload: { status: string; response_text: string }) => {
        try {
            const { data } = await axiosInstance.patch(`/correspondence/${id}/respond`, payload);
            const parsed = CorrespondenceDetailResponseSchema.parse(data);
            return normalizeCorrespondence(parsed.data);
        } catch (error) {
            throw toDomainError(error, 'Gagal mengirim respons surat.');
        }
    },

    updateStatus: async (id: number, status: string) => {
        try {
            const { data } = await axiosInstance.patch(`/correspondence/${id}/status`, { status });
            return data;
        } catch (error) {
            throw toDomainError(error, 'Gagal memperbarui status surat.');
        }
    },

    // CRUD Kategori
    createCategory: async (payload: { name: string; slug: string; description?: string }) => {
        try {
            const { data } = await axiosInstance.post('/correspondence/categories', payload);
            const parsed = CategoryDetailResponseSchema.parse(data);
            return parsed.data as Category;
        } catch (error) {
            throw toDomainError(error, 'Gagal membuat kategori.');
        }
    },

    updateCategory: async (id: number, payload: { name?: string; slug?: string; description?: string }) => {
        try {
            const { data } = await axiosInstance.patch(`/correspondence/categories/${id}`, payload);
            const parsed = CategoryDetailResponseSchema.parse(data);
            return parsed.data as Category;
        } catch (error) {
            throw toDomainError(error, 'Gagal memperbarui kategori.');
        }
    },

    deleteCategory: async (id: number) => {
        try {
            const { data } = await axiosInstance.delete(`/correspondence/categories/${id}`);
            return data;
        } catch (error) {
            throw toDomainError(error, 'Gagal menghapus kategori.');
        }
    },

    // CRUD Penerima
    createRecipient: async (payload: { name: string; slug: string; description?: string }) => {
        try {
            const { data } = await axiosInstance.post('/correspondence/recipients', payload);
            const parsed = RecipientDetailResponseSchema.parse(data);
            return parsed.data as Recipient;
        } catch (error) {
            throw toDomainError(error, 'Gagal membuat penerima.');
        }
    },

    updateRecipient: async (id: number, payload: { name?: string; slug?: string; description?: string }) => {
        try {
            const { data } = await axiosInstance.patch(`/correspondence/recipients/${id}`, payload);
            const parsed = RecipientDetailResponseSchema.parse(data);
            return parsed.data as Recipient;
        } catch (error) {
            throw toDomainError(error, 'Gagal memperbarui penerima.');
        }
    },

    deleteRecipient: async (id: number) => {
        try {
            const { data } = await axiosInstance.delete(`/correspondence/recipients/${id}`);
            return data;
        } catch (error) {
            throw toDomainError(error, 'Gagal menghapus penerima.');
        }
    },
};