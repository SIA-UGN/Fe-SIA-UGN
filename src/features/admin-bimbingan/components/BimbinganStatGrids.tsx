'use client';

import { FileText, BookOpen, User, Users, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '@/services/adminBimbinganService';

interface BimbinganStatGridsProps {
  stats: DashboardStats | null;
}

interface StatCardConfig {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
}

export const BimbinganStatGrids = ({ stats }: BimbinganStatGridsProps) => {
  if (!stats) return null;

  const cards: StatCardConfig[] = [
    {
      key: 'pengajuanBaru',
      title: 'Pengajuan TA Baru',
      subtitle: 'Minggu ini',
      icon: <FileText className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
    },
    {
      key: 'totalJudul',
      title: 'Total Judul TA',
      subtitle: 'Tersedia',
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
    },
    {
      key: 'dosenAktif',
      title: 'Dosen Pembimbing Aktif',
      subtitle: 'Terdaftar',
      icon: <User className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      key: 'mhsMonitoring',
      title: 'Mahasiswa Monitoring',
      subtitle: 'Dalam bimbingan',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          {/* Top Row - Icon and Arrow */}
          <div className="flex items-start justify-between mb-4">
            <div className={`${card.bgColor} rounded-lg p-3 flex items-center justify-center`}>
              {card.icon}
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
          </div>

          {/* Bottom Row - Number and Subtitle */}
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.grids[card.key as keyof typeof stats.grids]}
            </div>
            <p className="text-sm text-gray-500">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
