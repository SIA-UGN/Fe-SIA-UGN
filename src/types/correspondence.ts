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

    // Respond to letter
    respond: async (id: number, payload: { status: string; response_text: string }) => {
        return await axiosInstance.patch(`/correspondence/${id}/respond`, payload);
    },

    // Update Status Only
    updateStatus: async (id: number, status: string) => {
        return await axiosInstance.patch(`/correspondence/${id}/status`, { status });
    }
};