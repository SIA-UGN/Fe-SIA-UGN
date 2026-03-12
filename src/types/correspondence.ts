import axiosInstance from '@/lib/axios';
import { Correspondence, CorrespondencePayload, Category, Recipient } from '@/types/correspondence.d';

export const correspondenceService = {
    // --- PUBLIC / STUDENT / LECTURER ---

    // Get All Letters (Support filters later if needed)
    getAll: async () => {
        const { data } = await axiosInstance.get<{ data: Correspondence[] }>('/correspondence');
        return data.data;
    },

    // Get Single Letter
    getDetail: async (id: number) => {
        const { data } = await axiosInstance.get<{ data: Correspondence }>(`/correspondence/${id}`);
        return data.data;
    },

    // Create Letter (Multipart for attachment)
    create: async (payload: CorrespondencePayload) => {
        const formData = new FormData();
        formData.append('id_category', String(payload.id_category));
        formData.append('id_recipient', String(payload.id_recipient));
        formData.append('title', payload.title);
        formData.append('correspondence_body', payload.correspondence_body);
        if (payload.attachment) {
            formData.append('attachment', payload.attachment);
        }

        return await axiosInstance.post('/correspondence', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Update Letter (Multipart — uses POST + _method PATCH for Laravel)
    update: async (id: number, payload: CorrespondencePayload) => {
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('id_category', String(payload.id_category));
        formData.append('id_recipient', String(payload.id_recipient));
        formData.append('title', payload.title);
        formData.append('correspondence_body', payload.correspondence_body);
        if (payload.attachment) {
            formData.append('attachment', payload.attachment);
        }

        return await axiosInstance.post(`/correspondence/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Delete Letter
    delete: async (id: number) => {
        return await axiosInstance.delete(`/correspondence/${id}`);
    },

    // --- MASTER DATA (Categories & Recipients) ---
    getCategories: async () => {
        const { data } = await axiosInstance.get<{ data: Category[] }>('/correspondence/categories');
        return data.data;
    },

    getRecipients: async () => {
        const { data } = await axiosInstance.get<{ data: Recipient[] }>('/correspondence/recipients');
        return data.data;
    },

    // --- ADMIN / MANAGER ONLY ---
    // Membalas surat dan mengubah status
    respond: async (id: number, payload: { status: string; response_text: string }) => {
        const { data } = await axiosInstance.post(`/correspondence/${id}/respond`, {
            ...payload,
            _method: 'PATCH',
        });
        return data;
    },

    // Mengubah status tanpa balasan
    updateStatus: async (id: number, status: string) => {
        const { data } = await axiosInstance.post(`/correspondence/${id}/status`, {
            status,
            _method: 'PATCH',
        });
        return data;
    },

    // CRUD Kategori
    createCategory: async (payload: { name: string; slug: string; description?: string }) => {
        return await axiosInstance.post('/correspondence/categories', payload);
    },
    updateCategory: async (id: number, payload: any) => {
        return await axiosInstance.patch(`/correspondence/categories/${id}`, payload);
    },
    deleteCategory: async (id: number) => {
        return await axiosInstance.delete(`/correspondence/categories/${id}`);
    },

    // CRUD Penerima (Sama seperti kategori)
    createRecipient: async (payload: { name: string; slug: string; description?: string }) => {
        return await axiosInstance.post('/correspondence/recipients', payload);
    },
    updateRecipient: async (id: number, payload: any) => {
        return await axiosInstance.patch(`/correspondence/recipients/${id}`, payload);
    },
    deleteRecipient: async (id: number) => {
        return await axiosInstance.delete(`/correspondence/recipients/${id}`);
    }
};