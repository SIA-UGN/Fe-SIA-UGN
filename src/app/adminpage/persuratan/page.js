'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { SuccessMessageBox } from '@/components/ui/message-box';

import { useAdminPersuratan } from '@/features/admin-persuratan/hooks/useAdminPersuratan';
import AdminStatCard from '@/features/admin-persuratan/components/AdminStatCard';
import AdminFilterBar from '@/features/admin-persuratan/components/AdminFilterBar';
import AdminSuratTable from '@/features/admin-persuratan/components/AdminSuratTable';
import UpdateStatusModal from '@/features/admin-persuratan/components/UpdateStatusModal';
import DeleteSuratModal from '@/features/admin-persuratan/components/DeleteSuratModal';

const font = { fontFamily: 'Urbanist, sans-serif' };

export default function AdminPersuratanPage() {
    const {
        data,
        categories,
        isLoading,
        error,
        successMessage,
        stats,

        filterCategory, setFilterCategory,
        filterStatus, setFilterStatus,
        filterDateFrom, setFilterDateFrom,
        filterDateTo, setFilterDateTo,
        searchQuery, setSearchQuery,
        clearFilters,

        isStatusModalOpen,
        selectedSuratForStatus,
        openStatusModal,
        closeStatusModal,
        handleUpdateStatus,
        isUpdatingStatus,

        isDeleteModalOpen,
        selectedSuratForDelete,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
        isDeleting,

        refetch,
    } = useAdminPersuratan();

    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Admin Navbar */}
            <AdminNavbar title="Manajemen Persuratan" />

            {/* Main Content */}
            <main className="flex-1 bg-brand-light-sage">
                <div className="p-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Back link */}
                        <Link
                            href="/adminpage"
                            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-80"
                            style={{ color: '#015023', ...font }}
                        >
                            <ArrowLeft size={18} />
                            Kembali ke Dashboard
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                            <div>
                                <h1
                                    className="text-2xl sm:text-3xl font-bold mb-1"
                                    style={{ color: '#015023', ...font }}
                                >
                                    Statistik Persuratan
                                </h1>
                                <p className="text-gray-500 text-sm" style={font}>
                                    Kelola semua surat masuk dan perbarui statusnya
                                </p>
                            </div>
                            <Link href="/persuratan/ajukan">
                                <PrimaryButton className="flex items-center gap-2">
                                    <Plus size={18} />
                                    Ajukan Surat
                                </PrimaryButton>
                            </Link>
                        </div>

                        {/* Success toast */}
                        {successMessage && (
                            <SuccessMessageBox message={successMessage} />
                        )}

                        {/* Error */}
                        {error && (
                            <ErrorMessageBoxWithButton
                                message={error}
                                action={refetch}
                            />
                        )}

                        {/* Stats Card */}
                        <div className="mb-6">
                            <AdminStatCard stats={stats} isLoading={isLoading} />
                        </div>

                        {/* Filter Bar */}
                        <div className="mb-6">
                            <AdminFilterBar
                                categories={categories}
                                filterCategory={filterCategory}
                                setFilterCategory={setFilterCategory}
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                                filterDateFrom={filterDateFrom}
                                setFilterDateFrom={setFilterDateFrom}
                                filterDateTo={filterDateTo}
                                setFilterDateTo={setFilterDateTo}
                                clearFilters={clearFilters}
                            />
                        </div>

                        {/* Table */}
                        <div className="mb-8">
                            <AdminSuratTable
                                data={data}
                                isLoading={isLoading}
                                onDetail={(item) => router.push(`/adminpage/persuratan/${item.id_correspondence ?? item.id}`)}
                                onEdit={(item) => openStatusModal(item)}
                                onDelete={(item) => openDeleteModal(item)}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Modals */}
            <UpdateStatusModal
                open={isStatusModalOpen}
                onOpenChange={(open) => !open && closeStatusModal()}
                surat={selectedSuratForStatus}
                onConfirm={handleUpdateStatus}
                isLoading={isUpdatingStatus}
            />

            <DeleteSuratModal
                open={isDeleteModalOpen}
                onOpenChange={(open) => !open && closeDeleteModal()}
                surat={selectedSuratForDelete}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
