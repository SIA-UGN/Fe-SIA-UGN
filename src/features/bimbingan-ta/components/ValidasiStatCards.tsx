'use client';

import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { ValidasiStats } from '@/features/bimbingan-ta/hooks/useValidasiTA';

interface ValidasiStatCardsProps {
  stats: ValidasiStats;
}

export default function ValidasiStatCards({ stats }: ValidasiStatCardsProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={font}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Menunggu Review</p>
          <p className="text-3xl font-bold text-[#015023] mt-1">{stats.pending}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
          <FileText size={22} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Disetujui</p>
          <p className="text-3xl font-bold text-[#015023] mt-1">{stats.approved}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
          <CheckCircle2 size={22} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Ditolak</p>
          <p className="text-3xl font-bold text-[#015023] mt-1">{stats.rejected}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
          <XCircle size={22} />
        </div>
      </div>
    </div>
  );
}
