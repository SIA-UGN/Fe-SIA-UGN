'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  dosenTaService,
  extract422Message,
  type DosenTaTitle,
  type DosenTaTitlePayload,
} from '@/services/dosenTaService';

const DEFAULT_CATEGORY_OPTIONS = [
  'Artificial Intelligence',
  'Software Engineering',
  'Data Science',
  'Cyber Security',
  'Internet of Things',
  'Lainnya',
];

export function useKelolaJudulTA() {
  const [data, setData] = useState<DosenTaTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DosenTaTitle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isArchivingId, setIsArchivingId] = useState<number | null>(null);
  const [isRepublishingId, setIsRepublishingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** Error yang tampil di dalam modal form (biasanya 422) */
  const [modalError, setModalError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORY_OPTIONS);

  const showSuccess = useCallback((message: string) => {
    setErrorMessage(null);
    setSuccessMessage(message);
  }, []);

  const showError = useCallback((message: string) => {
    setSuccessMessage(null);
    setErrorMessage(message);
  }, []);

  const getErrorStatus = (err: any): number | undefined => err?.response?.status;
  const isForbiddenError = (err: any) => getErrorStatus(err) === 403;
  const isValidationError = (err: any) => getErrorStatus(err) === 422;

  const getFriendlyErrorMessage = (err: any, fallback: string): string => {
    if (isForbiddenError(err)) {
      return 'Akses Ditolak: Anda tidak memiliki izin (bukan Dosen) untuk melihat atau mengelola data ini.';
    }
    if (isValidationError(err)) {
      const msg = extract422Message(err);
      return msg ? `Validasi Gagal — ${msg}` : 'Data tidak valid. Periksa kembali isian form.';
    }
    return err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? fallback;
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [result, apiCategories] = await Promise.all([
        dosenTaService.getAll(),
        dosenTaService.getCategories().catch(() => []),
      ]);

      const categoriesFromApi = apiCategories
        .map((item: any) => String(item?.name ?? item?.category ?? item?.topic ?? '').trim())
        .filter(Boolean);
      const categoriesFromTitles = result
        .map((item) => String(item?.category ?? '').trim())
        .filter(Boolean);
      const mergedCategories = Array.from(
        new Set([...categoriesFromApi, ...categoriesFromTitles, ...DEFAULT_CATEGORY_OPTIONS]),
      );

      setData(result);
      setCategoryOptions(mergedCategories);
      setAccessDenied(false);
    } catch (err: any) {
      console.error('[useKelolaJudulTA] fetchData error:', err);
      if (isForbiddenError(err)) {
        setAccessDenied(true);
      }
      showError(getFriendlyErrorMessage(err, 'Gagal memuat data judul TA.'));
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: DosenTaTitle) => {
    setEditingItem(item);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setModalError(null);
  }, []);

  const handleCreate = useCallback(async (payload: DosenTaTitlePayload) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await dosenTaService.create(payload);
      showSuccess('Judul TA berhasil ditambahkan.');
      setAccessDenied(false);
      closeModal();
      await fetchData();
    } catch (err: any) {
      if (!isValidationError(err) && !isForbiddenError(err)) {
        console.error('[useKelolaJudulTA] handleCreate error:', err);
      }
      if (isForbiddenError(err)) {
        setAccessDenied(true);
        closeModal();
      } else if (isValidationError(err)) {
        // 422 → tampilkan di dalam modal, jangan tutup
        setModalError(getFriendlyErrorMessage(err, 'Gagal menambahkan judul TA.'));
      } else {
        showError(getFriendlyErrorMessage(err, 'Gagal menambahkan judul TA.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [closeModal, fetchData, showError, showSuccess]);

  const handleUpdate = useCallback(async (id: number, payload: DosenTaTitlePayload) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await dosenTaService.update(id, payload);
      showSuccess('Judul TA berhasil diperbarui.');
      setAccessDenied(false);
      closeModal();
      await fetchData();
    } catch (err: any) {
      if (!isValidationError(err) && !isForbiddenError(err)) {
        console.error('[useKelolaJudulTA] handleUpdate error:', err);
      }
      if (isForbiddenError(err)) {
        setAccessDenied(true);
        closeModal();
      } else if (isValidationError(err)) {
        // 422 → tampilkan di dalam modal, jangan tutup
        setModalError(getFriendlyErrorMessage(err, 'Gagal memperbarui judul TA.'));
      } else {
        showError(getFriendlyErrorMessage(err, 'Gagal memperbarui judul TA.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [closeModal, fetchData, showError, showSuccess]);

  const handleDelete = useCallback(async (id: number) => {
    const target = data.find((item) => item.id === id);
    if (target?.status === 'published') {
      showError('Topik yang sudah dipublikasikan tidak dapat dihapus. Arsipkan topik terlebih dahulu.');
      return;
    }

    if (target?.status === 'archived') {
      showError('Topik yang sudah diarsipkan tidak dapat dihapus.');
      return;
    }

    setIsDeletingId(id);
    setErrorMessage(null);
    try {
      await dosenTaService.delete(id);
      showSuccess('Judul TA berhasil dihapus.');
      setAccessDenied(false);
      await fetchData();
    } catch (err: any) {
      if (!isValidationError(err) && !isForbiddenError(err)) {
        console.error('[useKelolaJudulTA] handleDelete error:', err);
      }
      if (isForbiddenError(err)) {
        setAccessDenied(true);
      }
      showError(getFriendlyErrorMessage(err, 'Gagal menghapus judul TA.'));
    } finally {
      setIsDeletingId(null);
    }
  }, [data, fetchData, showError, showSuccess]);

  const handleArchive = useCallback(async (id: number) => {
    setIsArchivingId(id);
    setErrorMessage(null);
    try {
      await dosenTaService.archiveTopic(id);
      showSuccess('Topik TA berhasil diarsipkan.');
      setAccessDenied(false);
      await fetchData();
    } catch (err: any) {
      if (!isValidationError(err) && !isForbiddenError(err)) {
        console.error('[useKelolaJudulTA] handleArchive error:', err);
      }
      if (isForbiddenError(err)) {
        setAccessDenied(true);
      }
      showError(getFriendlyErrorMessage(err, 'Gagal mengarsipkan topik TA.'));
    } finally {
      setIsArchivingId(null);
    }
  }, [fetchData, showError, showSuccess]);

  const handleRepublish = useCallback(async (id: number) => {
    setIsRepublishingId(id);
    setErrorMessage(null);
    try {
      // Try direct publish first
      await dosenTaService.publishTopic(id);
      showSuccess('Topik TA berhasil dipublikasikan ulang.');
      setAccessDenied(false);
      await fetchData();
    } catch (publishErr: any) {
      // If backend requires draft status before publishing, use the update flow
      const msg = String(publishErr?.response?.data?.message ?? '').toLowerCase();
      const needsDraft =
        publishErr?.response?.status === 422 &&
        (msg.includes('draft') || msg.includes('hanya topik'));

      if (needsDraft) {
        try {
          // Find the current item to build a payload for moveTopicToDraft
          const target = data.find((item) => item.id === id);
          if (target) {
            await dosenTaService.update(id, {
              id_program: target.id_program,
              title_ind: target.title_ind,
              title_eng: target.title_eng,
              category: target.category,
              description: target.description,
              quota_total: target.quota_total,
              status: 'published',
            });
            showSuccess('Topik TA berhasil dipublikasikan ulang.');
            setAccessDenied(false);
            await fetchData();
          } else {
            showError('Topik tidak ditemukan di data lokal.');
          }
        } catch (retryErr: any) {
          if (isForbiddenError(retryErr)) {
            setAccessDenied(true);
          }
          showError(getFriendlyErrorMessage(retryErr, 'Gagal mempublikasikan ulang topik TA.'));
        }
      } else {
        if (isForbiddenError(publishErr)) {
          setAccessDenied(true);
        }
        showError(getFriendlyErrorMessage(publishErr, 'Gagal mempublikasikan ulang topik TA.'));
      }
    } finally {
      setIsRepublishingId(null);
    }
  }, [data, fetchData, showError, showSuccess]);

  const filteredData = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return data;

    return data.filter((item) =>
      item.title_ind.toLowerCase().includes(keyword) ||
      item.title_eng.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword),
    );
  }, [data, searchQuery]);

  return {
    data,
    filteredData,
    isLoading,
    accessDenied,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    isSubmitting,
    isDeletingId,
    isArchivingId,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    modalError,
    setModalError,
    categoryOptions,
    fetchData,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchive,
    handleRepublish,
    isRepublishingId,
  };
}
