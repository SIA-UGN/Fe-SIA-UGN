'use client';

import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { RecentSubmission } from '@/services/adminBimbinganService';

interface PengajuanTerbaruListProps {
  submissions: RecentSubmission[];
  onItemClick: (item: RecentSubmission) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusConfig = (status: RecentSubmission['status']) => {
  switch (status) {
    case 'Menunggu Approval':
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        label: 'Menunggu Approval',
      };
    case 'Approved':
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        label: '✓ Approved',
      };
    case 'Ditolak':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        label: '✕ Ditolak',
      };
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hari ini';
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';

  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
};

export const PengajuanTerbaruList = ({ submissions, onItemClick }: PengajuanTerbaruListProps) => {
  return (
    <div className="mt-8" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Pengajuan TA Terbaru</h2>
        <Link
          href="/admin/pengajuan-ta"
          className="text-sm text-[#015023] font-semibold hover:underline"
        >
          Lihat semua →
        </Link>
      </div>

      {/* List Items */}
      {submissions.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
          Tidak ada pengajuan TA
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const initials = getInitials(item.name);

            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className="bg-white p-4 rounded-xl mb-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100"
              >
                {/* Left - Avatar */}
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#015023] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {initials}
                  </div>

                  {/* Middle - Details */}
                  <div className="ml-3 flex-1 min-w-0">
                    {/* Name and Date */}
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                      <span className="text-xs text-gray-400">{item.nim}</span>
                    </div>

                    {/* Date and Meta */}
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.date)}</p>

                    {/* Title */}
                    <p className="text-sm font-semibold text-[#015023] mt-1 truncate">{item.title}</p>

                    {/* Pembimbing Info */}
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      {item.pembimbing ? (
                        <>
                          <span className="font-semibold text-green-600">Pembimbing:</span>
                          <span>{item.pembimbing}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Belum ada pembimbing</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right - Status Badge and Arrow */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}
                  >
                    {statusConfig.label}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
