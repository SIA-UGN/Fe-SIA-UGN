'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import DataTable from '@/components/ui/table';

const font = { fontFamily: 'Urbanist, sans-serif' };

// Status badge configuration
const statusConfig = {
    submitted: { label: 'Diajukan', bg: '#E5E7EB', text: '#374151' },
    process: { label: 'Diproses', bg: '#FEF3C7', text: '#92400E' },
    resolved: { label: 'Selesai', bg: '#D1FAE5', text: '#065F46' },
    rejected: { label: 'Ditolak', bg: '#FEE2E2', text: '#991B1B' },
};

/**
 * Admin correspondence table with integrated search bar.
 * Reuses the existing DataTable with custom renderers.
 */
export default function AdminSuratTable({
    data = [],
    isLoading = false,
    onEdit,
    onDelete,
    searchQuery = '',
    setSearchQuery,
}) {
    const columns = [
        { key: 'created_at', label: 'Tanggal', width: '110px' },
        { key: 'user', label: 'Mahasiswa', width: '170px' },
        { key: 'category', label: 'Kategori', width: '120px' },
        { key: 'title', label: 'Judul Keluhan' },
        { key: 'recipient', label: 'Tujuan', width: '140px' },
        { key: 'status', label: 'Status', width: '110px' },
    ];

    const customRender = {
        created_at: (value) => {
            if (!value) return '-';
            try {
                return new Date(value).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric',
                });
            } catch { return value; }
        },

        user: (value, item) => {
            const name = item.user?.name || '-';
            const email = item.user?.email || '';
            return (
                <div className="text-left">
                    <p className="font-semibold text-sm" style={{ color: '#015023', ...font }}>{name}</p>
                    {email && <p className="text-xs text-gray-400" style={font}>{email}</p>}
                </div>
            );
        },

        category: (value, item) => (
            <span
                className="inline-block px-2.5 py-1 text-xs font-medium"
                style={{ borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', ...font }}
            >
                {item.category?.name || '-'}
            </span>
        ),

        recipient: (value, item) => item.recipient?.name || '-',

        status: (value) => {
            const config = statusConfig[value] || statusConfig.submitted;
            return (
                <span
                    className="inline-block px-3 py-1 text-xs font-semibold"
                    style={{ borderRadius: '20px', backgroundColor: config.bg, color: config.text, ...font }}
                >
                    {config.label}
                </span>
            );
        },
    };

    return (
        <div>
            {/* Search bar with gold background */}
            {setSearchQuery && (
                <div
                    className="flex items-center gap-3 px-4 py-3 mb-4"
                    style={{
                        backgroundColor: '#E5C158',
                        borderRadius: '12px',
                    }}
                >
                    <Search size={20} style={{ color: '#015023' }} />
                    <input
                        type="text"
                        placeholder="Cari surat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none placeholder-[#015023]/50 text-sm font-medium"
                        style={{ color: '#015023', ...font }}
                    />
                </div>
            )}

            {/* Table */}
            <DataTable
                columns={columns}
                data={data}
                actions={['edit', 'delete']}
                onEdit={(item) => onEdit?.(item)}
                onDelete={(item) => onDelete?.(item)}
                customRender={customRender}
                isLoading={isLoading}
                nomertext="No"
                pagination={true}
            />
        </div>
    );
}
