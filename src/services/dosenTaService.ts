import axiosInstance from '@/lib/axios';

export type TaTitleStatus = 'draft' | 'published' | 'archived';

export interface DosenTaTitle {
  id: number;
  id_program: number;
  /** Judul Bahasa Indonesia */
  title_ind: string;
  /** Judul Bahasa Inggris */
  title_eng: string;
  /** Alias display — sama dengan title_ind */
  title: string;
  /** Topik / kategori (nama string) */
  category: string;
  description: string;
  quota_total: number;
  quota_filled: number;
  status: TaTitleStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DosenTaTitlePayload {
  id_program: number;
  title_ind: string;
  title_eng: string;
  category: string;   // dikirim ke backend sebagai `topic`
  description: string;
  quota_total: number;
  status: TaTitleStatus;
}

export interface CreateTopicPayload {
  topic: string;
  title_ind: string;
  title_eng: string;
  description: string;
  quota: number;
  id_program: number;
}

export interface LecturerRequestItem {
  [key: string]: any;
}

export interface LecturerCategoryItem {
  id?: number;
  name?: string;
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

async function patchWithRouteFallback<T = any>(path: string, body?: any, config?: any): Promise<T> {
  let lastError: any;
  for (const currentPath of getFallbackPaths(path)) {
    try {
      const { data } = await axiosInstance.patch<T>(currentPath, body, config);
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function putWithRouteFallback<T = any>(path: string, body?: any, config?: any): Promise<T> {
  let lastError: any;
  for (const currentPath of getFallbackPaths(path)) {
    try {
      const { data } = await axiosInstance.put<T>(currentPath, body, config);
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

const THESIS_TOPICS_BASE = '/api/lecturer/thesis/topics';
const LECTURER_THESIS_BASE = '/api/lecturer/thesis';

/**
 * Membongkar pesan validasi Laravel dari error 422.
 * Mengembalikan string yang siap ditampilkan ke user, misalnya:
 *   "title_ind: The title ind field is required."
 */
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

function normalizeStatus(value: unknown): TaTitleStatus {
  const text = String(value ?? '').toLowerCase();
  if (
    text === 'archived' ||
    text === 'archive' ||
    text === 'arsip' ||
    text === 'inactive' ||
    text === 'nonaktif'
  ) {
    return 'archived';
  }
  if (
    text === 'published' ||
    text === 'publish' ||
    text === 'post' ||
    text === 'posted' ||
    text === 'available' ||
    text === 'taken' ||
    text === 'open' ||
    text === 'active' ||
    text === 'aktif'
  ) {
    return 'published';
  }
  return 'draft';
}

function normalizeTitleItem(raw: any): DosenTaTitle {
  const titleInd = String(raw?.title_ind ?? raw?.title ?? raw?.topic ?? '-');
  const titleEng = String(raw?.title_eng ?? raw?.title ?? raw?.topic ?? '-');
  const category = String(
    raw?.topic ??
    raw?.category?.name ??
    raw?.category_name ??
    raw?.category ??
    '',
  );
  return {
    id: Number(raw?.id_thesis_topic ?? raw?.id ?? raw?.id_topic ?? Date.now()),
    id_program: Number(raw?.id_program ?? raw?.program?.id_program ?? raw?.program?.id ?? 0),
    title_ind: titleInd,
    title_eng: titleEng,
    title: titleInd,   // alias untuk tampilan
    category,
    description: String(raw?.description ?? raw?.summary ?? raw?.detail ?? '-'),
    quota_total: Number(raw?.quota ?? raw?.quota_total ?? raw?.max_quota ?? raw?.capacity ?? 1),
    quota_filled: Number(raw?.quota_filled ?? raw?.quota_used ?? raw?.filled ?? 0),
    status: normalizeStatus(raw?.status),
    created_at: raw?.created_at,
    updated_at: raw?.updated_at,
  };
}

function extractList(responseData: any): any[] {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData)) return responseData;
  return [];
}

function toTopicPayload(payload: DosenTaTitlePayload) {
  return {
    id_program: Number(payload.id_program),
    topic: payload.category,
    title_ind: payload.title_ind,
    title_eng: payload.title_eng,
    description: payload.description,
    quota: payload.quota_total,
    status: payload.status,
  };
}

async function moveTopicToDraft(id: number, payload: DosenTaTitlePayload): Promise<void> {
  const fullBody = {
    ...toTopicPayload(payload),
    status: 'draft',
  };

  try {
    // Final fallback: full PUT with status=draft.
    await putWithRouteFallback(`${THESIS_TOPICS_BASE}/${id}`, fullBody);
  } catch (error: any) {
    console.error("❌ API Error Details (moveTopicToDraft):", error?.response?.data);
    throw error;
  }
}

function toCreateTopicPayload(payload: CreateTopicPayload | DosenTaTitlePayload): CreateTopicPayload {
  if ('topic' in payload) {
    return {
      topic: payload.topic,
      title_ind: payload.title_ind,
      title_eng: payload.title_eng,
      description: payload.description,
      quota: Number(payload.quota),
      id_program: Number(payload.id_program),
    };
  }

  return {
    topic: payload.category,
    title_ind: payload.title_ind,
    title_eng: payload.title_eng,
    description: payload.description,
    quota: Number(payload.quota_total),
    id_program: Number(payload.id_program),
  };
}

export const dosenTaService = {
  async getTopics(): Promise<DosenTaTitle[]> {
    try {
      const data = await getWithRouteFallback<ApiResponse<any>>(THESIS_TOPICS_BASE);
      const items = extractList(data);
      return items.map(normalizeTitleItem);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async createTopic(payload: CreateTopicPayload): Promise<DosenTaTitle> {
    try {
      const data = await postWithRouteFallback<ApiResponse<any>>(THESIS_TOPICS_BASE, payload);
      return normalizeTitleItem(data?.data ?? data);
    } catch (error) {
      throw error;
    }
  },

  async publishTopic(id: number): Promise<void> {
    try {
      await patchWithRouteFallback(`${THESIS_TOPICS_BASE}/${id}/publish`);
    } catch (error) {
      throw error;
    }
  },

  async archiveTopic(id: number): Promise<void> {
    try {
      await patchWithRouteFallback(`${THESIS_TOPICS_BASE}/${id}/archive`);
    } catch (error) {
      throw error;
    }
  },

  async getRequests(status?: string): Promise<LecturerRequestItem[]> {
    try {
      const data = await getWithRouteFallback<ApiResponse<any> | any>(
        `${LECTURER_THESIS_BASE}/requests`,
        {
          params: status ? { status } : undefined,
        },
      );
      return extractList(data);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  async approveRequest(id: number): Promise<void> {
    try {
      await patchWithRouteFallback(`${LECTURER_THESIS_BASE}/requests/${id}/approve`);
    } catch (error) {
      throw error;
    }
  },

  async rejectRequest(id: number, note: string): Promise<void> {
    try {
      await patchWithRouteFallback(`${LECTURER_THESIS_BASE}/requests/${id}/reject`, {
        rejection_note: note,
      });
    } catch (error) {
      throw error;
    }
  },

  async getCategories(): Promise<LecturerCategoryItem[]> {
    try {
      const data = await getWithRouteFallback<ApiResponse<any> | any>(`${LECTURER_THESIS_BASE}/categories`);
      return extractList(data);
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      throw error;
    }
  },

  // Backward-compatible wrappers used by existing UI hooks
  async getAll(): Promise<DosenTaTitle[]> {
    return this.getTopics();
  },

  async create(payload: DosenTaTitlePayload): Promise<DosenTaTitle> {
    const topicPayload = toCreateTopicPayload(payload);
    const created = await this.createTopic(topicPayload);

    if (payload.status === 'published') {
      await this.publishTopic(created.id);
      const latest = await this.getTopics();
      return latest.find((item) => item.id === created.id) ?? { ...created, status: 'published' };
    }

    return created;
  },

  async update(id: number, payload: DosenTaTitlePayload): Promise<DosenTaTitle> {
    try {
      const data = await putWithRouteFallback<ApiResponse<any>>(`${THESIS_TOPICS_BASE}/${id}`, toTopicPayload(payload));
      const updated = normalizeTitleItem({ id, ...(data?.data ?? data) });

      if (payload.status === 'published' && updated.status !== 'published') {
        await this.publishTopic(id);
        return { ...updated, status: 'published' };
      }

      return updated;
    } catch (error: any) {
      console.error("❌ API Error Details:", error.response?.data);
      const message = String(error?.response?.data?.message ?? '').toLowerCase();
      const isValidation422 = error?.response?.status === 422;
      const blockedBecausePublished =
        message.includes('dipublikasikan') ||
        message.includes('published');
      const publishRequiresDraft =
        message.includes('hanya topik berstatus draft') ||
        message.includes('hanya topik draft') ||
        message.includes('status draft');

      // Some backends block PUT for previously published topics,
      // but still allow explicit republish endpoint.
      if (payload.status === 'published' && isValidation422 && blockedBecausePublished) {
        try {
          await this.publishTopic(id);
        } catch (publishError: any) {
          const publishMessage = String(publishError?.response?.data?.message ?? '').toLowerCase();
          const publishNeedsDraft =
            publishError?.response?.status === 422 &&
            (publishMessage.includes('hanya topik berstatus draft') ||
              publishMessage.includes('hanya topik draft') ||
              publishMessage.includes('status draft'));

          if (!publishNeedsDraft) {
            throw publishError;
          }

          await moveTopicToDraft(id, payload);
          await this.publishTopic(id);
        }

        const latest = await this.getTopics();
        const republished = latest.find((item) => item.id === id);
        if (republished) return republished;

        return {
          id,
          id_program: payload.id_program,
          title_ind: payload.title_ind,
          title_eng: payload.title_eng,
          title: payload.title_ind,
          category: payload.category,
          description: payload.description,
          quota_total: payload.quota_total,
          quota_filled: 0,
          status: 'published',
        };
      }

      // If backend requires draft before publish, force transition to draft then publish.
      if (payload.status === 'published' && isValidation422 && publishRequiresDraft) {
        await moveTopicToDraft(id, payload);
        await this.publishTopic(id);

        const latest = await this.getTopics();
        const republished = latest.find((item) => item.id === id);
        if (republished) return republished;

        return {
          id,
          id_program: payload.id_program,
          title_ind: payload.title_ind,
          title_eng: payload.title_eng,
          title: payload.title_ind,
          category: payload.category,
          description: payload.description,
          quota_total: payload.quota_total,
          quota_filled: 0,
          status: 'published',
        };
      }

      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    await deleteWithRouteFallback(`${THESIS_TOPICS_BASE}/${id}`);
  },
};
