'use client';

import { Users, UserCheck, User, UserCog, ArrowUpRight } from 'lucide-react';
import { UserStats } from '@/features/admin-bimbingan/hooks/useKelolaUser';

interface UserStatGridsProps {
  stats: UserStats;
}

interface StatCardConfig {
  key: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

export const UserStatGrids = ({ stats }: UserStatGridsProps) => {
  const cards: StatCardConfig[] = [
    {
      key: 'totalMahasiswa',
      title: 'Total Mahasiswa',
      value: stats.totalMahasiswa,
      icon: <Users className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
    },
    {
      key: 'sudahPunyaDosen',
      title: 'Sudah Punya Dosen',
      value: stats.sudahPunyaDosen,
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
      bgColor: 'bg-emerald-100',
    },
    {
      key: 'totalDosen',
      title: 'Total Dosen',
      value: stats.totalDosen,
      icon: <User className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      key: 'dosenAktif',
      title: 'Dosen Aktif',
      value: stats.dosenAktif,
      icon: <UserCog className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {cards.map((card) => (
        <div key={card.key} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
          {/* Top Row - Icon and Arrow */}
          <div className="flex items-start justify-between mb-4">
            <div className={`${card.bgColor} rounded-lg p-3 flex items-center justify-center`}>{card.icon}</div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
          </div>

          {/* Bottom Row - Number and Title */}
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
