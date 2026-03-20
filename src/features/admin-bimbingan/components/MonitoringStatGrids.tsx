'use client';

import { Clock, CheckCircle, UserCheck, UserX } from 'lucide-react';
import { GridStats } from '@/features/admin-bimbingan/hooks/useMonitoringPengajuan';

interface MonitoringStatGridsProps {
  stats: GridStats;
}

interface StatCardConfig {
  key: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

export const MonitoringStatGrids = ({ stats }: MonitoringStatGridsProps) => {
  const cards: StatCardConfig[] = [
    {
      key: 'menungguApproval',
      title: 'Menunggu Approval',
      value: stats.menungguApproval,
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
    },
    {
      key: 'approved',
      title: 'Approved',
      value: stats.approved,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-100',
    },
    {
      key: 'sudahAdaDosen',
      title: 'Sudah Ada Dosen',
      value: stats.sudahAdaDosen,
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      key: 'belumAdaDosen',
      title: 'Belum Ada Dosen',
      value: stats.belumAdaDosen,
      icon: <UserX className="w-6 h-6 text-gray-600" />,
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {cards.map((card) => (
        <div key={card.key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={`${card.bgColor} rounded-lg p-3 flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>

            {/* Text */}
            <div>
              <p className="text-sm text-gray-600 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
