'use client';

import { BookOpen } from 'lucide-react';
import { DashboardStats } from '@/services/adminBimbinganService';

interface BimbinganHeroCardProps {
  stats: DashboardStats | null;
}

export const BimbinganHeroCard = ({ stats }: BimbinganHeroCardProps) => {
  if (!stats) return null;

  return (
    <div
      className="bg-[#015023] text-white p-6 rounded-2xl flex items-center justify-between"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      {/* Left Section - Total Pengajuan TA */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white/80 mb-2">Total Pengajuan TA</span>
        <span className="text-5xl font-bold text-white">{stats.hero.total}</span>
        <span className="text-xs font-medium text-white/70 mt-2">Pengajuan Terakhir</span>
      </div>

      {/* Center Section - Status Group (Approved, Menunggu, Ditolak) */}
      <div className="flex gap-6 items-center">
        {/* Approved */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{stats.hero.approved}</span>
          <span className="text-xs text-white/70 mt-1">Approved</span>
        </div>

        {/* Menunggu */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{stats.hero.menunggu}</span>
          <span className="text-xs text-white/70 mt-1">Menunggu</span>
        </div>

        {/* Ditolak */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{stats.hero.ditolak}</span>
          <span className="text-xs text-white/70 mt-1">Ditolak</span>
        </div>
      </div>

      {/* Right Section - Gold Icon */}
      <div className="flex-shrink-0">
        <div className="bg-[#D4B54D] rounded-full p-4 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#015023]" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};
