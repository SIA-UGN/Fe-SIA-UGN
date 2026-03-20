'use client';

import { Search, ArrowUpDown } from 'lucide-react';
import { UserTab } from '@/features/admin-bimbingan/hooks/useKelolaUser';

interface UserFilterBarProps {
  activeTab: UserTab;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy?: string;
  onSortChange?: (sort: 'nama' | 'nim' | 'ipk') => void;
}

export const UserFilterBar = ({
  activeTab,
  searchTerm,
  onSearchChange,
  sortBy = 'nama',
  onSortChange = () => {},
}: UserFilterBarProps) => {
  const isMahasiswaTab = activeTab === 'mahasiswa';
  const isDosenTab = activeTab === 'dosen';

  const sortOptions = [
    { value: 'nama', label: 'Nama (A-Z)' },
    { value: 'nim', label: 'NIM' },
    { value: 'ipk', label: 'IPK (Tertinggi)' },
  ];

  return (
    <div
      className="space-y-4 mb-6 bg-white rounded-xl border border-gray-100 p-6"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
      role="toolbar"
      aria-label="Filter dan sort data mahasiswa"
    >
      {/* Filter Dropdowns - Only show for Mahasiswa tab */}
      {isMahasiswaTab && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="prodi-filter" className="text-xs font-semibold text-gray-700">
              Program Studi
            </label>
            <select
              id="prodi-filter"
              defaultValue=""
              aria-label="Filter berdasarkan program studi"
              className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
            >
              <option value="">Semua Program</option>
              <option value="ti">Teknik Informatika</option>
              <option value="si">Sistem Informasi</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status-filter" className="text-xs font-semibold text-gray-700">
              Status
            </label>
            <select
              id="status-filter"
              defaultValue=""
              aria-label="Filter berdasarkan status mahasiswa"
              className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="tidak-aktif">Tidak Aktif</option>
              <option value="lulus">Lulus</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pembimbing-filter" className="text-xs font-semibold text-gray-700">
              Pembimbing
            </label>
            <select
              id="pembimbing-filter"
              defaultValue=""
              aria-label="Filter berdasarkan status pembimbing"
              className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
            >
              <option value="">Semua</option>
              <option value="ada">Ada Pembimbing</option>
              <option value="tidak">Tidak Ada Pembimbing</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sort-select" className="text-xs font-semibold text-gray-700">
              Urutkan
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'nama' || value === 'nim' || value === 'ipk') {
                  onSortChange(value);
                }
              }}
              aria-label="Urutkan data mahasiswa"
              className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filter Dropdowns - Only show Status for Dosen tab */}
      {isDosenTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="dosen-status-filter" className="text-xs font-semibold text-gray-700">
              Status
            </label>
            <select
              id="dosen-status-filter"
              defaultValue=""
              aria-label="Filter berdasarkan status dosen"
              className="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#015023] focus:border-transparent font-medium transition-all hover:border-gray-400"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="tidak-aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
        <label htmlFor="search-input" className="text-xs font-semibold text-gray-700">
          Pencarian
        </label>
        <div className="relative bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg p-3 flex items-center gap-3 border border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-[#015023] focus-within:border-transparent transition-all">
          <Search
            className="w-5 h-5 text-[#015023] flex-shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            id="search-input"
            type="text"
            placeholder={isMahasiswaTab ? 'Cari Mahasiswa, NIM, atau Program Studi...' : 'Cari Dosen, NIP, atau Bidang...'}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={isMahasiswaTab ? 'Cari mahasiswa' : 'Cari dosen'}
            className="flex-1 bg-transparent text-[#015023] placeholder-[#015023]/60 focus:outline-none font-medium text-sm"
          />
        </div>
      </div>
    </div>
  );
};
