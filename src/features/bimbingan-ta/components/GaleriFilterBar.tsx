'use client';

import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import CustomUGNSelect from '@/features/bimbingan-ta/components/CustomUGNSelect';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GaleriFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedKategori: string;
  onKategoriChange: (value: string) => void;
  kategoriOptions?: string[];
  sortBy?: 'terbaru' | 'populer' | 'nama';
  onSortChange?: (sort: 'terbaru' | 'populer' | 'nama') => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GaleriFilterBar({
  searchTerm,
  onSearchChange,
  selectedKategori,
  onKategoriChange,
  kategoriOptions = ['Semua Kategori'],
  sortBy = 'populer',
  onSortChange,
}: GaleriFilterBarProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };
  const kategoriSelectOptions = kategoriOptions.map((kategori) => ({
    label: kategori,
    value: kategori,
  }));

  const sortOptions = [
    { label: 'Paling Populer', value: 'populer' },
    { label: 'Terbaru', value: 'terbaru' },
    { label: 'Nama (A-Z)', value: 'nama' },
  ];

  return (
    <div
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-lg px-4 py-4 shadow-sm border border-gray-200 hover:border-gray-300 transition"
      style={font}
      role="toolbar"
      aria-label="Filter dan urut galeri TA"
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari judul atau nama dosen..."
          className="w-full rounded-lg bg-gradient-to-br from-gray-50 to-gray-25 border-gray-200 border py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10 hover:border-gray-300"
          style={font}
          aria-label="Cari judul TA atau nama dosen pembimbing"
        />
      </div>

      {/* Category Dropdown */}
      <div className="shrink-0 min-w-[200px]">
        <CustomUGNSelect
          label={selectedKategori === 'Semua Kategori' ? 'Semua kategori' : selectedKategori}
          required
          value={selectedKategori}
          placeholder="Pilih Kategori"
          options={kategoriSelectOptions}
          onChange={onKategoriChange}
        />
      </div>

      {/* Sort Dropdown */}
      <div className="shrink-0 min-w-[160px]">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value as 'terbaru' | 'populer' | 'nama')}
            className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 outline-none transition hover:border-gray-300 focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            style={font}
            aria-label="Urutkan hasil pencarian"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
