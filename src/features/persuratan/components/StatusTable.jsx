'use client';

import { useState, useEffect } from 'react';
import { FileText, Inbox, RefreshCw } from 'lucide-react';

// ── Status badge config ────────────────────────────────────────────
const STATUS_MAP = {
    submitted: {
        label: 'Diajukan',
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

// ── Helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES_ID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    // Hydration-safe: no locale dependency
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <td key={i} className="px-6 py-4">
                    <div
                        className="animate-pulse"
                        style={{
                            height: '14px',
                            borderRadius: '6px',
                            backgroundColor: '#E5E7EB',
                            width: i === 2 ? '70%' : i === 5 ? '80px' : '50%',
                        }}
                    />
                </td>
            ))}
        </tr>
    );
}

// ── Main component ──────────────────────────────────────────────────
export default function StatusTable({ data = [], isLoading = false, error = null, refetch = null }) {
    const font = { fontFamily: 'Urbanist, sans-serif' };

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
                    <span className="font-semibold text-base">Riwayat Persuratan</span>
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
        <div
            className="bg-white shadow-lg overflow-hidden"
            style={{ borderRadius: '12px', ...font }}
        >
            {/* Card header */}
            <div
                className="text-white px-6 py-4 flex items-center justify-between"
                style={{ backgroundColor: '#015023', borderRadius: '12px 12px 0 0' }}
            >
                <div className="flex items-center gap-3">
                    <FileText size={20} />
                    <span className="font-semibold text-base">Riwayat Persuratan</span>
                </div>
                {!isLoading && (
                    <span
                        className="text-sm opacity-80"
                        style={{ fontWeight: 400 }}
                    >
                        {data.length} surat ditemukan
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full" style={{ ...font, fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                            {['No.', 'Judul Surat', 'Kategori', 'Tujuan', 'Status', 'Tanggal'].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3 text-left font-semibold"
                                        style={{ color: '#015023', fontSize: '13px', borderBottom: '1px solid #E5E7EB' }}
                                    >
                                        {h}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading skeleton */}
                        {isLoading &&
                            [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

                        {/* Empty state */}
                        {!isLoading && data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
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
                            data.map((item, idx) => (
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
                                    <td
                                        className="px-6 py-4"
                                        style={{ color: '#9CA3AF', fontWeight: 500 }}
                                    >
                                        {idx + 1}
                                    </td>
                                    <td
                                        className="px-6 py-4 font-medium"
                                        style={{ color: '#111827', maxWidth: '280px' }}
                                    >
                                        <span className="line-clamp-1">{item.title}</span>
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#4B5563' }}>
                                        {item.category?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#4B5563' }}>
                                        {item.recipient?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td
                                        className="px-6 py-4"
                                        style={{ color: '#6B7280', whiteSpace: 'nowrap' }}
                                    >
                                        <HydratedDate iso={item.created_at} />
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
