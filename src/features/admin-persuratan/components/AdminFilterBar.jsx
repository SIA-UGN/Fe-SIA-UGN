'use client';

import { SlidersHorizontal, X } from 'lucide-react';

const font = { fontFamily: 'Urbanist, sans-serif' };

const selectStyle = {
    ...font,
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    padding: '8px 32px 8px 12px',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#374151',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
};

const inputStyle = {
    ...font,
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    padding: '8px 12px',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#374151',
};

/**
 * Compact left-aligned filter bar.
 * Funnel icon + Kategori + Status + Dari Tanggal + Sampai Tanggal
 */
export default function AdminFilterBar({
    categories = [],
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    clearFilters,
}) {
    const hasActiveFilters = filterCategory || filterStatus || filterDateFrom || filterDateTo;

    return (
        <div
            className="bg-white px-4 md:px-5 py-4 shadow-lg"
            style={{ borderRadius: '14px', ...font }}
        >
            <div className="flex flex-wrap items-center gap-4">
                {/* Filter icon + label */}
                <div className="flex items-center justify-center gap-2 shrink-0">
                    <SlidersHorizontal size={18} style={{ color: '#015023' }} />
                    <span
                        className="text-sm font-bold whitespace-nowrap"
                        style={{ color: '#015023' }}
                    >
                        Filter
                    </span>
                </div>

                {/* Kategori */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide" style={font}>
                        Kategori
                    </label>
                    <select
                        style={{ ...selectStyle, minWidth: '150px' }}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Semua</option>
                        {categories.map((cat) => (
                            <option key={cat.id_category} value={cat.id_category}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide" style={font}>
                        Status
                    </label>
                    <select
                        style={{ ...selectStyle, minWidth: '150px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Semua</option>
                        <option value="submitted">Diajukan</option>
                        <option value="process">Diproses</option>
                        <option value="resolved">Selesai</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                </div>

                {/* Dari Tanggal */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide" style={font}>
                        Dari Tanggal
                    </label>
                    <input
                        type="date"
                        style={{ ...inputStyle, minWidth: '150px' }}
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                    />
                </div>

                {/* Sampai Tanggal */}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide" style={font}>
                        Sampai Tanggal
                    </label>
                    <input
                        type="date"
                        style={{ ...inputStyle, minWidth: '150px' }}
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                    />
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 shrink-0"
                        style={{ borderRadius: '8px', border: '1px solid #d1d5db', height: 'fit-content', ...font }}
                    >
                        <X size={12} />
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
