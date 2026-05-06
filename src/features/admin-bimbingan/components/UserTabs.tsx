'use client';

import { UserTab } from '@/features/admin-bimbingan/hooks/useKelolaUser';

interface UserTabsProps {
  activeTab: UserTab;
  onTabChange: (tab: UserTab) => void;
  mahasiswaCount: number;
  dosenCount: number;
}

export const UserTabs = ({ activeTab, onTabChange, mahasiswaCount, dosenCount }: UserTabsProps) => {
  return (
    <div className="flex gap-2 mb-6" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Mahasiswa Tab */}
      <button
        onClick={() => onTabChange('mahasiswa')}
        className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
          activeTab === 'mahasiswa' ? 'bg-[#015023] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        } border ${activeTab === 'mahasiswa' ? 'border-[#015023]' : 'border-gray-100'}`}
      >
        Mahasiswa
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'mahasiswa' ? 'bg-white text-[#015023]' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {mahasiswaCount}
        </span>
      </button>

      {/* Dosen Tab */}
      <button
        onClick={() => onTabChange('dosen')}
        className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
          activeTab === 'dosen' ? 'bg-[#015023] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        } border ${activeTab === 'dosen' ? 'border-[#015023]' : 'border-gray-100'}`}
      >
        Dosen
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'dosen' ? 'bg-white text-[#015023]' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {dosenCount}
        </span>
      </button>
    </div>
  );
};
