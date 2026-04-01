'use client';

import { use, useState } from 'react';
import { useAdminDetailSurat } from '@/features/admin-persuratan/hooks/useAdminDetailSurat';
import DetailHeader from '@/features/admin-persuratan/components/DetailHeader';
import DetailMainContent from '@/features/admin-persuratan/components/DetailMainContent';
import DetailMetaSidebar from '@/features/admin-persuratan/components/DetailMetaSidebar';
import UpdateStatusModal from '@/features/admin-persuratan/components/UpdateStatusModal';
import DeleteSuratModal from '@/features/admin-persuratan/components/DeleteSuratModal';
import { correspondenceService } from '@/types/correspondence';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { RefreshCw } from 'lucide-react';

const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

// ── Skeleton that mimics the 2-column layout ────────────────────────
function PageSkeleton() {
    return (
        <div className="animate-pulse" style={font}>
            {/* Header skeleton */}
            <div className="mb-6">
                <div className="h-4 w-48 rounded bg-gray-200 mb-4" />
                <div className="h-8 w-72 rounded bg-gray-200" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content skeleton */}
                <div className="lg:col-span-2 bg-white shadow-sm rounded-xl p-6 space-y-4">
                    <div className="h-6 w-3/4 rounded bg-gray-200" />
                    <hr className="border-gray-100" />
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-5/6 rounded bg-gray-200" />
                        <div className="h-4 w-4/6 rounded bg-gray-200" />
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                    </div>
                    <div className="h-16 w-full rounded-lg bg-gray-100 mt-4" />
                </div>

                {/* Sidebar skeleton */}
                <div className="lg:col-span-1 bg-white shadow-sm rounded-xl p-6 space-y-5">
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="space-y-1 flex-1">
                            <div className="h-4 w-32 rounded bg-gray-200" />
                            <div className="h-3 w-24 rounded bg-gray-200" />
                        </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="h-4 w-36 rounded bg-gray-200" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-gray-200" />
                                <div className="space-y-1 flex-1">
                                    <div className="h-3 w-20 rounded bg-gray-200" />
                                    <div className="h-4 w-28 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <hr className="border-gray-100" />
                    <div className="h-11 w-full rounded-xl bg-gray-200" />
                </div>
            </div>
        </div>
    );
}

// ── Page component ──────────────────────────────────────────────────
export default function AdminDetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Next.js 15: `params` is a Promise — unwrap with `use()`
    const { id } = use(params);
    const numericId = Number(id);

    const { data, isLoading, error, refetch } = useAdminDetailSurat(numericId);
    const router = useRouter();

    // ── Status modal state ──────────────────────────────────────────
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // ── Delete modal state ──────────────────────────────────────────
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (correspondenceId: number) => {
        setIsDeleting(true);
        try {
            await correspondenceService.delete(correspondenceId ?? numericId);
            router.replace('/adminpage/persuratan');
        } catch (err) {
            console.error('[DetailSurat] Delete error:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateStatus = async (
        correspondenceId: number,
        newStatus: string,
    ) => {
        setIsUpdatingStatus(true);
        try {
            await correspondenceService.updateStatus(correspondenceId, newStatus);
            setIsStatusModalOpen(false);
            refetch(); // Reload detail to reflect new status
            return true;
        } catch (err) {
            console.error('[DetailSurat] Update status error:', err);
            return false;
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Admin Navbar */}
            <AdminNavbar title="Detail Persuratan" />

            {/* Main Content */}
            <main className="flex-1" style={{ backgroundColor: '#F5F7F5' }}>
                <div className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* ── Loading ──────────────────────────── */}
                        {isLoading && <PageSkeleton />}

                        {/* ── Error ────────────────────────────── */}
                        {!isLoading && error && (
                            <div
                                className="bg-white shadow-sm rounded-xl p-8 text-center flex flex-col items-center gap-4"
                                style={font}
                            >
                                <p className="text-sm text-red-600">{error}</p>
                                <button
                                    onClick={refetch}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 cursor-pointer"
                                    style={{ backgroundColor: '#015023' }}
                                >
                                    <RefreshCw size={16} />
                                    Coba Lagi
                                </button>
                            </div>
                        )}

                        {/* ── Data ─────────────────────────────── */}
                        {!isLoading && !error && data && (
                            <>
                                {/* Header (back link + title + badge) */}
                                <DetailHeader status={data.status} />

                                {/* 2‑column grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main content — 2 cols */}
                                    <div className="lg:col-span-2">
                                        <DetailMainContent data={data} />
                                    </div>

                                    {/* Sidebar — 1 col */}
                                    <div className="lg:col-span-1">
                                        <DetailMetaSidebar
                                            data={data}
                                            onUpdateStatus={() => setIsStatusModalOpen(true)}
                                            onDelete={() => setIsDeleteModalOpen(true)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Update Status Modal (reuses the existing component) */}
            {data && (
                <UpdateStatusModal
                    open={isStatusModalOpen}
                    onOpenChange={(open: boolean) =>
                        !open && setIsStatusModalOpen(false)
                    }
                    surat={data}
                    onConfirm={handleUpdateStatus}
                    isLoading={isUpdatingStatus}
                />
            )}

            {/* Delete Modal */}
            {data && (
                <DeleteSuratModal
                    open={isDeleteModalOpen}
                    onOpenChange={(open: boolean) =>
                        !open && setIsDeleteModalOpen(false)
                    }
                    surat={data}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
}
