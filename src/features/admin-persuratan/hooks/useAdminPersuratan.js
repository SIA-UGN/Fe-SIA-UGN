'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    useCorrespondenceCategoriesQuery,
    useCorrespondenceListQuery,
    useDeleteCorrespondenceMutation,
    useUpdateCorrespondenceStatusMutation,
} from '@/features/persuratan/hooks/useCorrespondenceQueries';

/**
 * Custom hook for the Admin Persuratan page.
 * Manages data fetching, filtering, statistics, modal states, and CRUD operations.
 */
export function useAdminPersuratan() {
    const listQuery = useCorrespondenceListQuery();
    const categoriesQuery = useCorrespondenceCategoriesQuery();
    const updateStatusMutation = useUpdateCorrespondenceStatusMutation();
    const deleteMutation = useDeleteCorrespondenceMutation();

    const allData = listQuery.data || [];
    const categories = categoriesQuery.data || [];

    // ── Filter state ──────────────────────────────────────────────
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // ── Modal state: Update Status ────────────────────────────────
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedSuratForStatus, setSelectedSuratForStatus] = useState(null);

    // ── Modal state: Delete ───────────────────────────────────────
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSuratForDelete, setSelectedSuratForDelete] = useState(null);

    // ── Operation loading states ──────────────────────────────────
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Success/Error feedback ────────────────────────────────────
    const [successMessage, setSuccessMessage] = useState(null);
    const [actionError, setActionError] = useState(null);

    const error =
        actionError ||
        listQuery.error?.userMessage ||
        listQuery.error?.message ||
        categoriesQuery.error?.userMessage ||
        categoriesQuery.error?.message ||
        null;

    // ── Computed statistics ───────────────────────────────────────
    const stats = useMemo(() => {
        const total = allData.length;
        const diproses = allData.filter(s => s.status === 'process').length;
        const selesai = allData.filter(s => s.status === 'resolved').length;
        const ditolak = allData.filter(s => s.status === 'rejected').length;
        const diajukan = allData.filter(s => s.status === 'submitted').length;
        return { total, diproses, selesai, ditolak, diajukan };
    }, [allData]);

    // ── Client-side filtering ─────────────────────────────────────
    const filteredData = useMemo(() => {
        let result = [...allData];

        if (filterCategory) {
            result = result.filter(s =>
                String(s.id_category) === String(filterCategory) ||
                s.category?.name?.toLowerCase() === filterCategory.toLowerCase()
            );
        }

        if (filterStatus) {
            result = result.filter(s => s.status === filterStatus);
        }

        if (filterDateFrom) {
            const from = new Date(filterDateFrom);
            result = result.filter(s => new Date(s.created_at) >= from);
        }

        if (filterDateTo) {
            const to = new Date(filterDateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(s => new Date(s.created_at) <= to);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.title?.toLowerCase().includes(q) ||
                s.user?.name?.toLowerCase().includes(q) ||
                s.user?.email?.toLowerCase().includes(q) ||
                s.category?.name?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [allData, filterCategory, filterStatus, filterDateFrom, filterDateTo, searchQuery]);

    // ── Modal openers ─────────────────────────────────────────────
    const openStatusModal = useCallback((surat) => {
        setSelectedSuratForStatus(surat);
        setIsStatusModalOpen(true);
    }, []);

    const closeStatusModal = useCallback(() => {
        setIsStatusModalOpen(false);
        setSelectedSuratForStatus(null);
    }, []);

    const openDeleteModal = useCallback((surat) => {
        setSelectedSuratForDelete(surat);
        setIsDeleteModalOpen(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setSelectedSuratForDelete(null);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────
    const handleUpdateStatus = useCallback(async (id, newStatus) => {
        setIsUpdatingStatus(true);
        try {
            await updateStatusMutation.mutateAsync({ id, status: newStatus });
            setSuccessMessage('Status surat berhasil diperbarui');
            closeStatusModal();
            setTimeout(() => setSuccessMessage(null), 3000);
            return true;
        } catch (err) {
            console.error('[useAdminPersuratan] Update status error:', err);
            setActionError(err?.message || 'Gagal mengubah status surat.');
            return false;
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [closeStatusModal, updateStatusMutation]);

    const handleDelete = useCallback(async (id) => {
        setIsDeleting(true);
        try {
            await deleteMutation.mutateAsync(id);
            setSuccessMessage('Surat berhasil dihapus');
            closeDeleteModal();
            setTimeout(() => setSuccessMessage(null), 3000);
            return true;
        } catch (err) {
            console.error('[useAdminPersuratan] Delete error:', err);
            setActionError(err?.message || 'Gagal menghapus surat.');
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [closeDeleteModal, deleteMutation]);

    // ── Clear filters ─────────────────────────────────────────────
    const clearFilters = useCallback(() => {
        setFilterCategory('');
        setFilterStatus('');
        setFilterDateFrom('');
        setFilterDateTo('');
        setSearchQuery('');
    }, []);

    return {
        // Data
        data: filteredData,
        allData,
        categories,
        isLoading: listQuery.isLoading || categoriesQuery.isLoading,
        error,
        successMessage,
        stats,

        // Filter controls
        filterCategory, setFilterCategory,
        filterStatus, setFilterStatus,
        filterDateFrom, setFilterDateFrom,
        filterDateTo, setFilterDateTo,
        searchQuery, setSearchQuery,
        clearFilters,

        // Status modal
        isStatusModalOpen,
        selectedSuratForStatus,
        openStatusModal,
        closeStatusModal,
        handleUpdateStatus,
        isUpdatingStatus,

        // Delete modal
        isDeleteModalOpen,
        selectedSuratForDelete,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
        isDeleting,

        // Refresh
        refetch: listQuery.refetch,
    };
}
