'use client';

import { MonitoringDetailData } from '@/features/admin-bimbingan/hooks/useMonitoringDetail';

interface MonitoringDetailHeaderProps {
  data: MonitoringDetailData;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const MonitoringDetailHeader = ({ data }: MonitoringDetailHeaderProps) => {
  const isWaitingApproval = data.status_approval === 'Menunggu Approval';
  const isApproved = data.status_approval === 'Approved';
  const isRejected = data.status_approval === 'Ditolak';

  return (
    <div
      className="bg-[#015023] text-white p-6 rounded-2xl"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      {/* Top Section - Student Info & Badges */}
      <div className="flex items-start justify-between mb-6">
        {/* Left - Avatar & Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-lg bg-[#E5C158] text-[#015023] flex items-center justify-center flex-shrink-0 font-bold text-lg">
            {getInitials(data.nama)}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">{data.nama}</h2>
            <p className="text-sm text-white/80 mt-1">
              {data.nim} • Teknik Informatika • Semester {data.semester}
            </p>
            <p className="text-xs text-white/60 mt-0.5">{data.email}</p>
          </div>
        </div>

        {/* Right - Badges */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status Badge */}
          {isWaitingApproval && (
            <div className="px-3 py-1.5 rounded-full border-2 border-white bg-transparent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-semibold text-yellow-300">Menunggu Approval</span>
            </div>
          )}
          {isApproved && (
            <div className="px-3 py-1.5 rounded-full border-2 border-white bg-transparent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-green-300">Approved</span>
            </div>
          )}
          {isRejected && (
            <div className="px-3 py-1.5 rounded-full border-2 border-white bg-transparent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-red-300">Ditolak</span>
            </div>
          )}

          {/* IPK Badge */}
          <div className="px-3 py-1.5 rounded-full bg-[#01401C] text-white">
            <span className="text-xs font-semibold">IPK {data.ipk}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Title */}
      <div>
        <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">Judul Tugas Akhir</p>
        <h3 className="text-xl font-bold text-white mb-1">{data.judul}</h3>
        <p className="text-sm italic text-white/70">{data.judul_inggris}</p>
      </div>
    </div>
  );
};
