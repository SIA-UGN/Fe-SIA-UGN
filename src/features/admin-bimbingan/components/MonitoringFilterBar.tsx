'use client';

import { Search, ArrowUpDown } from 'lucide-react';

interface MonitoringFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterProdi: string;
  onProdiChange: (prodi: string) => void;
  filterDosen: string;
  onDosenChange: (dosen: string) => void;
  dateRange: string;
  onDateRangeChange: (date: string) => void;
  sortBy?: string;
  onSortChange?: (sort: 'terbaru' | 'nama' | 'status') => void;
}

export const MonitoringFilterBar = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterProdi,
  onProdiChange,
  filterDosen,
  onDosenChange,
  dateRange,
  onDateRangeChange,
  sortBy = 'terbaru',
  onSortChange = () => {},
}: MonitoringFilterBarProps) => {
  const sortOptions = [
    { value: 'terbaru', label: 'Paling Terbaru' },
    { value: 'nama', label: 'Nama Mahasiswa (A-Z)' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <div
      className="space-y-4 mb-6 bg-white rounded-xl border border-gray-100 p-6"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
      role="toolbar"
      aria-label="Filter dan sort data pengajuan"
    >
      {/* Filter Dropdowns and Sort */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="status-filter" className="text-xs font-semibold text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter berdasarkan status pengajuan"
            className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu Approval">Menunggu Approval</option>
            <option value="Approved">Approved</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>

        {/* Program Studi Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="prodi-filter" className="text-xs font-semibold text-gray-700">
            Program Studi
          </label>
          <select
            id="prodi-filter"
            value={filterProdi}
            onChange={(e) => onProdiChange(e.target.value)}
            aria-label="Filter berdasarkan program studi"
            className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
          >
            <option value="">Semua Program Studi</option>
            <option value="Teknik Informatika">Teknik Informatika</option>
            <option value="Sistem Informasi">Sistem Informasi</option>
          </select>
        </div>

        {/* Dosen Pembimbing Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="dosen-filter" className="text-xs font-semibold text-gray-700">
            Dosen Pembimbing
          </label>
          <select
            id="dosen-filter"
            value={filterDosen}
            onChange={(e) => onDosenChange(e.target.value)}
            aria-label="Filter berdasarkan status dosen pembimbing"
            className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
          >
            <option value="">Semua</option>
            <option value="ada">Ada Pembimbing</option>
            <option value="tidak">Belum Ada Pembimbing</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="date-filter" className="text-xs font-semibold text-gray-700">
            Tanggal
          </label>
          <input
            id="date-filter"
            type="date"
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            aria-label="Filter berdasarkan tanggal pengajuan"
            className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
          />
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-2">
          <label htmlFor="sort-select" className="text-xs font-semibold text-gray-700">
            Urutkan
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'terbaru' || value === 'nama' || value === 'status') {
                onSortChange(value);
              }
            }}
            aria-label="Urutkan data pengajuan"
            className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400 flex items-center gap-2"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
        <label htmlFor="search-input" className="text-xs font-semibold text-gray-700">
          Pencarian
        </label>
        <div className="relative bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg p-3 flex items-center gap-3 border border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-[#015023] focus-within:border-transparent transition-all">
          <Search className="w-5 h-5 text-[#015023] flex-shrink-0" strokeWidth={2} aria-hidden="true" />
          <input
            id="search-input"
            type="text"
            placeholder="Cari Mahasiswa, NIM, Judul, atau ID Pengajuan..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Cari pengajuan berdasarkan mahasiswa, NIM, judul, atau ID pengajuan"
            className="flex-1 bg-transparent text-[#015023] placeholder-[#015023]/60 focus:outline-none font-medium text-sm"
          />
        </div>
      </div>
    </div>
  );
};
