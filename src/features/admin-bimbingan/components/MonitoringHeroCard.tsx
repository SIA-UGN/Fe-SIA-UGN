'use client';

import { FileText } from 'lucide-react';
import { HeroStats } from '@/features/admin-bimbingan/hooks/useMonitoringPengajuan';

interface MonitoringHeroCardProps {
  stats: HeroStats;
}

export const MonitoringHeroCard = ({ stats }: MonitoringHeroCardProps) => {
  return (
    <div
      className="bg-[#015023] text-white p-6 rounded-2xl flex items-center justify-between"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      {/* Left Section - Total */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white/80 mb-2">Total Pengajuan TA</span>
        <span className="text-5xl font-bold text-white">{stats.total}</span>
        <span className="text-xs font-medium text-white/70 mt-2">Pengajuan terdaftar</span>
      </div>

      {/* Center Section - Status Group */}
      <div className="flex gap-8 items-center">
        {/* Menunggu */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-yellow-300">{stats.menunggu}</span>
          <span className="text-xs text-white/70 mt-1">Menunggu</span>
        </div>

        {/* Approved */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-green-300">{stats.approved}</span>
          <span className="text-xs text-white/70 mt-1">Approved</span>
        </div>

        {/* Ditolak */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-red-300">{stats.ditolak}</span>
          <span className="text-xs text-white/70 mt-1">Ditolak</span>
        </div>
      </div>

      {/* Right Section - Gold Icon */}
      <div className="flex-shrink-0">
        <div className="bg-[#D4B54D] rounded-2xl p-4 flex items-center justify-center">
          <FileText className="w-8 h-8 text-[#015023]" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};
