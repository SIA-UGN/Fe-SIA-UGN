'use client';

import { useState, useEffect } from 'react';
import { FileText, Inbox, RefreshCw, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';

// ── Status badge config ────────────────────────────────────────────
const STATUS_MAP = {
    submitted: {
        label: 'Menunggu',
        bg: '#F3F4F6',
        color: '#4B5563',
        dot: '#9CA3AF',
    },
    process: {
        label: 'Diproses',
        bg: '#FEF9C3',
        color: '#854D0E',
        dot: '#DABC4E',
    },
    resolved: {
        label: 'Selesai',
        bg: '#DCFCE7',
        color: '#166534',
        dot: '#16874B',
    },
    rejected: {
        label: 'Ditolak',
        bg: '#FEE2E2',
        color: '#991B1B',
        dot: '#BE0414',
    },
};

function StatusBadge({ status }) {
    const cfg = STATUS_MAP[status] || STATUS_MAP.submitted;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
            style={{
                backgroundColor: cfg.bg,
                color: cfg.color,
                borderRadius: '999px',
                fontFamily: 'Urbanist, sans-serif',
            }}
        >
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: cfg.dot,
                    flexShrink: 0,
                }}
            />
            {cfg.label}
        </span>
    );
}

// ── Category badge config ──────────────────────────────────────────
const CATEGORY_COLORS = {
    Akademik: {
        bg: '#DBEAFE',
        color: '#1E40AF',
        border: '#BFDBFE',
    },
    Keuangan: {
        bg: '#FEF3C7',
        color: '#92400E',
        border: '#FDE68A',
    },
    Fasilitas: {
        bg: '#CCFBF1',
        color: '#115E59',
        border: '#99F6E4',
    },
};

const DEFAULT_CATEGORY_COLOR = {
    bg: '#F3F4F6',
    color: '#374151',
    border: '#E5E7EB',
};

function CategoryBadge({ name }) {
    const cfg = CATEGORY_COLORS[name] || DEFAULT_CATEGORY_COLOR;
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold"
            style={{
                backgroundColor: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                borderRadius: '6px',
                fontFamily: 'Urbanist, sans-serif',
            }}
        >
            {name || '-'}
        </span>
    );
}

// ── Helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return `${d.getDate()} ${MONTH_NAMES_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/** Client-only date to avoid SSR/client mismatch */
function HydratedDate({ iso }) {
    const [formatted, setFormatted] = useState('-');
    useEffect(() => {
        setFormatted(formatDate(iso));
    }, [iso]);
    return <>{formatted}</>;
}

// ── Skeleton loader ─────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <td key={i} className="px-4 py-4">
                    <div
                        className="animate-pulse"
                        style={{
                            height: '14px',
                            borderRadius: '6px',
                            backgroundColor: '#E5E7EB',
                            width: i === 4 ? '80%' : i === 7 ? '60px' : '60%',
                        }}
                    />
                </td>
            ))}
        </tr>
    );
}

// ── Table Headers ───────────────────────────────────────────────────
const TABLE_HEADERS = ['No. Tiket', 'Tanggal', 'Kategori', 'Judul Keluhan', 'Tujuan', 'Status', 'Aksi'];

// ── Main component ──────────────────────────────────────────────────
export default function StatusTable({
    data = [],
    isLoading = false,
    error = null,
    refetch = null,
    onDelete = null,
    isDeleting = false,
    deletingId = null,
}) {
    const font = { fontFamily: 'Urbanist, sans-serif' };

    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const selectStyle = {
        ...font,
        fontSize: '13px',
        borderRadius: '8px',
        border: 'none',
        padding: '8px 32px 8px 12px',
        outline: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
    };

    const inputStyle = {
        ...font,
        fontSize: '13px',
        borderRadius: '8px',
        border: 'none',
        padding: '8px 12px 8px 36px', // Padding left for search icon
        outline: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter logic
    const filteredData = data?.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const ticketId = `SUR-${new Date(item.created_at).getFullYear()}-${String(item.id_correspondence).padStart(3, '0')}`.toLowerCase();
        const matchesSearch = item.title?.toLowerCase().includes(searchLower) || ticketId.includes(searchLower);
        const matchesStatus = filterStatus ? item.status === filterStatus : true;
        return matchesSearch && matchesStatus;
    }) || [];

    // Calculate paginated data based on filteredData
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Reset page if current page exceeds total pages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
            setCurrentPage(1);
        }
    }, [totalItems, totalPages, currentPage]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete && onDelete) {
            onDelete(itemToDelete.id_correspondence);
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    // ── Error state ───────────────────────────────────────────────────
    if (error && !isLoading) {
        return (
            <div
                className="bg-white shadow-lg overflow-hidden"
                style={{ borderRadius: '12px', ...font }}
            >
                <div
                    className="text-white px-6 py-4 flex items-center gap-3"
                    style={{ backgroundColor: '#015023', borderRadius: '12px 12px 0 0' }}
                >
                    <FileText size={20} />
                    <span className="font-semibold text-base">Daftar Persuratan</span>
                </div>
                <div className="p-8 text-center flex flex-col items-center gap-4">
                    <p style={{ color: '#BE0414', fontSize: '15px', ...font }}>{error}</p>
                    {refetch && (
                        <button
                            onClick={refetch}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                        >
                            <RefreshCw size={16} />
                            Coba Lagi
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────
    return (
        <div style={font} className="w-full">
            <div
                className="bg-white shadow-lg overflow-hidden"
                style={{ borderRadius: '12px' }}
            >
                {/* Card header */}
                <div
                    className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{ backgroundColor: '#015023', borderRadius: '12px 12px 0 0' }}
                >
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-[#D4B54D]" />
                        <span className="font-semibold text-base text-white">Daftar Persuratan</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-white/70" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari keluhan..."
                                className="placeholder-white/70"
                                style={{ ...inputStyle, width: '220px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Dropdown for filter */}
                        <div className="relative">
                            <select
                                style={{
                                    ...selectStyle,
                                    width: '120px',
                                }}
                                className="transition-colors focus:ring-1 focus:ring-white/50"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="" className="text-gray-900 bg-white">Semua</option>
                                <option value="submitted" className="text-gray-900 bg-white">Menunggu</option>
                                <option value="process" className="text-gray-900 bg-white">Diproses</option>
                                <option value="resolved" className="text-gray-900 bg-white">Selesai</option>
                                <option value="rejected" className="text-gray-900 bg-white">Ditolak</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ ...font, fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB' }}>
                                {TABLE_HEADERS.map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left font-semibold"
                                        style={{
                                            color: '#015023',
                                            fontSize: '13px',
                                            borderBottom: '2px solid #E5E7EB',
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Loading skeleton */}
                            {isLoading &&
                                [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

                            {/* Empty state */}
                            {!isLoading && filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div
                                                className="flex items-center justify-center"
                                                style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#E6EEE9',
                                                }}
                                            >
                                                <Inbox size={28} style={{ color: '#16874B' }} />
                                            </div>
                                            <p
                                                style={{
                                                    ...font,
                                                    fontWeight: 600,
                                                    fontSize: '15px',
                                                    color: '#015023',
                                                }}
                                            >
                                                Belum ada riwayat persuratan
                                            </p>
                                            <p style={{ ...font, fontSize: '13px', color: '#6B7280' }}>
                                                Anda belum pernah mengajukan surat. Mulai buat pengajuan pertama Anda.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Data rows */}
                            {!isLoading &&
                                currentItems.map((item, idx) => {
                                    const canAct = item.status === 'submitted';
                                    const isThisDeleting = isDeleting && deletingId === item.id_correspondence;

                                    return (
                                        <tr
                                            key={item.id_correspondence}
                                            className="transition-colors duration-150"
                                            style={{
                                                borderBottom: '1px solid #F3F4F6',
                                                cursor: 'default',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            {/* No. Tiket */}
                                            <td
                                                className="px-4 py-4 font-medium"
                                                style={{ color: '#111827', whiteSpace: 'nowrap' }}
                                            >
                                                {item.ticket_number || `SUR-${new Date(item.created_at).getFullYear()}-${String(item.id_correspondence).padStart(3, '0')}`}
                                            </td>

                                            {/* Tanggal */}
                                            <td
                                                className="px-4 py-4"
                                                style={{ color: '#6B7280', whiteSpace: 'nowrap' }}
                                            >
                                                <HydratedDate iso={item.created_at} />
                                            </td>

                                            {/* Kategori */}
                                            <td className="px-4 py-4">
                                                <CategoryBadge name={item.category?.name} />
                                            </td>

                                            {/* Judul Keluhan */}
                                            <td
                                                className="px-4 py-4 font-medium"
                                                style={{ color: '#111827', maxWidth: '320px' }}
                                            >
                                                <span className="line-clamp-1">{item.title}</span>
                                            </td>

                                            {/* Tujuan */}
                                            <td className="px-4 py-4" style={{ color: '#4B5563' }}>
                                                {item.recipient?.name || '-'}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    {/* Edit */}
                                                    {canAct ? (
                                                        <Link
                                                            href={`/persuratan/edit/${item.id_correspondence}`}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-green-50"
                                                            title="Edit surat"
                                                        >
                                                            <Pencil size={16} style={{ color: '#015023' }} />
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md"
                                                            style={{ opacity: 0.3, cursor: 'not-allowed' }}
                                                            title="Tidak dapat diedit"
                                                        >
                                                            <Pencil size={16} style={{ color: '#6B7280' }} />
                                                        </span>
                                                    )}

                                                    {/* Delete */}
                                                    {canAct ? (
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            disabled={isThisDeleting}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-red-50 cursor-pointer"
                                                            title="Hapus surat"
                                                        >
                                                            {isThisDeleting ? (
                                                                <RefreshCw size={16} className="animate-spin" style={{ color: '#991B1B' }} />
                                                            ) : (
                                                                <Trash2 size={16} style={{ color: '#991B1B' }} />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md"
                                                            style={{ opacity: 0.3, cursor: 'not-allowed' }}
                                                            title="Tidak dapat dihapus"
                                                        >
                                                            <Trash2 size={16} style={{ color: '#6B7280' }} />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {/* Pagination Footer */}
                <div className="flex justify-between items-center p-4 text-sm text-gray-500 border-t border-gray-200 bg-white">
                    <p>
                        Menampilkan {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} sampai {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} keluhan
                    </p>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1) setCurrentPage(p => p - 1);
                                }}
                                disabled={currentPage <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span className="mx-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages) setCurrentPage(p => p + 1);
                                }}
                                disabled={currentPage >= totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertConfirmationRedDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Hapus Surat"
                description={`Apakah Anda yakin ingin menghapus surat "${itemToDelete?.title || ''}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
