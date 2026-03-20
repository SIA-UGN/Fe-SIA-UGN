'use client';

import { Calendar, UserX, UserCheck } from 'lucide-react';
import { PengajuanTA } from '@/features/admin-bimbingan/hooks/useMonitoringPengajuan';

interface MonitoringTableProps {
  pengajuan: PengajuanTA[];
  onDetailClick: (id: string) => void;
  isLoading?: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusConfig = (status: PengajuanTA['status']) => {
  switch (status) {
    case 'Menunggu Approval':
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    case 'Approved':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    case 'Ditolak':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const MonitoringTable = ({ pengajuan, onDetailClick, isLoading = false }: MonitoringTableProps) => {
  const itemsPerPage = 5;
  const totalPages = Math.ceil(pengajuan.length / itemsPerPage);
  const currentPage = 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPengajuan = pengajuan.slice(startIndex, startIndex + itemsPerPage);
  const totalCount = pengajuan.length;
  const displayStart = startIndex + 1;
  const displayEnd = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-opacity duration-200"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
      role="table"
      aria-label="Tabel monitoring pengajuan tugas akhir"
    >
      {/* Table Header */}
      <div className="bg-[#D4B54D] text-[#015023]" role="rowgroup">
        <div className="grid grid-cols-12 gap-3 px-6 py-4 font-bold text-sm" role="row">
          <div className="col-span-1" role="columnheader">
            No
          </div>
          <div className="col-span-1.5" role="columnheader">
            ID Pengajuan
          </div>
          <div className="col-span-2.5" role="columnheader">
            Mahasiswa
          </div>
          <div className="col-span-2" role="columnheader">
            Judul TA
          </div>
          <div className="col-span-1.5" role="columnheader">
            Tgl. Pengajuan
          </div>
          <div className="col-span-1" role="columnheader">
            Status
          </div>
          <div className="col-span-1.5" role="columnheader">
            Pembimbing
          </div>
          <div className="col-span-1" role="columnheader">
            Aksi
          </div>
        </div>
      </div>

      {/* Table Body or Skeleton */}
      {isLoading ? (
        <div className="divide-y divide-gray-100" role="rowgroup">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="hover:bg-gray-50 transition-colors" role="row">
              <div className="grid grid-cols-12 gap-3 px-6 py-4 items-start text-sm">
                <div className="col-span-1 bg-gray-200 h-5 rounded animate-pulse" />
                <div className="col-span-1.5 bg-gray-200 h-5 rounded animate-pulse" />
                <div className="col-span-2.5 flex items-start gap-2.5">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="bg-gray-200 h-4 rounded animate-pulse" />
                    <div className="bg-gray-200 h-3 rounded animate-pulse w-2/3" />
                  </div>
                </div>
                <div className="col-span-2 bg-gray-200 h-5 rounded animate-pulse" />
                <div className="col-span-1.5 bg-gray-200 h-5 rounded animate-pulse" />
                <div className="col-span-1 bg-gray-200 h-5 rounded animate-pulse" />
                <div className="col-span-1.5 bg-gray-200 h-5 rounded animate-pulse" />
                <div className="col-span-1 bg-gray-200 h-8 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100" role="rowgroup">
          {displayedPengajuan.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">Tidak ada data pengajuan</div>
          ) : (
            displayedPengajuan.map((item, idx) => {
              const statusConfig = getStatusConfig(item.status);

              return (
                <div key={item.id} className="hover:bg-gray-50 transition-colors" role="row">
                  <div className="grid grid-cols-12 gap-3 px-6 py-4 items-start text-sm">
                  {/* No */}
                  <div className="col-span-1 text-gray-600 pt-2">{startIndex + idx + 1}</div>

                  {/* ID Pengajuan */}
                  <div className="col-span-1.5 pt-2">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-semibold">
                      {item.idPengajuan}
                    </span>
                  </div>

                  {/* Mahasiswa */}
                  <div className="col-span-2.5 flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#015023] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {getInitials(item.mahasiswa.nama)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{item.mahasiswa.nama}</p>
                      <p className="text-xs text-gray-500">{item.mahasiswa.nim}</p>
                      <p className="text-xs text-gray-500">{item.mahasiswa.prodi}</p>
                    </div>
                  </div>

                  {/* Judul TA */}
                  <div className="col-span-2 text-gray-700 pt-2 truncate">
                    <span title={item.judul}>{item.judul.substring(0, 30)}...</span>
                  </div>

                  {/* Tgl. Pengajuan */}
                  <div className="col-span-1.5 flex items-center gap-1.5 text-gray-600 pt-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(item.tanggal)}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 pt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status === 'Menunggu Approval' ? 'Menunggu' : item.status}
                    </span>
                  </div>

                  {/* Pembimbing */}
                  <div className="col-span-1.5">
                    {item.pembimbing ? (
                      <div className="bg-[#E6F4EA] border border-[#C6F0D4] rounded-lg px-2 py-1.5 inline-block">
                        <div className="flex items-center gap-1.5 text-[#015023]">
                          <UserCheck className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-semibold">Sudah Ada</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{item.pembimbing.nama}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 inline-block">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <UserX className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-semibold">Belum Ada</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aksi */}
                  <div className="col-span-1 pt-2">
                    <button
                      onClick={() => onDetailClick(item.id)}
                      className="bg-[#015023] text-white text-xs px-4 py-1.5 rounded-md font-semibold hover:bg-[#013018] transition-colors"
                    >
                      Detail →
                    </button>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="px-6 py-4 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <span>
          Menampilkan {isLoading ? '-' : displayStart}-{isLoading ? '-' : displayEnd} dari {isLoading ? '-' : totalCount}{' '}
          data
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-xs font-semibold transition-colors"
            disabled
            aria-label="Halaman sebelumnya"
          >
            ← Sebelumnya
          </button>
          <span className="px-3 py-1.5 text-gray-700 font-semibold" aria-current="page">
            {isLoading ? '-' : currentPage}
          </span>
          <button
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-xs font-semibold transition-colors"
            disabled
            aria-label="Halaman berikutnya"
          >
            Berikutnya →
          </button>
        </div>
      </div>
    </div>
  );
};
